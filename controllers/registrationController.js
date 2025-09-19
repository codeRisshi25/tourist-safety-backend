const db = require("../models/index.js");
const { Tourist, Authority, Itinerary, BlockchainId } = db;
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const {
  registerTouristOnBlockchain,
} = require("../service/blockchainService.js");
const { geocodeItineraryDetails } = require("../service/GeocodingService.js");

const registrationController = {
  registerTourist: async (req, res, next) => {
    try {
      const { role } = req.user;
      if (role !== "authority") {
        return res
          .status(403)
          .json({ error: "Access denied. Authorities only." });
      }

      const {
        name,
        phone,
        email,
        password,
        nationality,
        kycId,
        emergencyContact,
        itinerary, // Changed to a single object
      } = req.body;

      // --- MODIFIED: Check for a single itinerary object ---
      if (!itinerary || typeof itinerary !== "object") {
        return res
          .status(400)
          .json({ error: "A single itinerary object is required." });
      }

      // Basic validation
      if (!name || !email || !password || !phone) {
        return res.status(400).json({
          error: "Missing required fields: name, email, password, or phone.",
        });
      }

      // Check existing user
      const existing = await Tourist.findOne({
        where: { [Op.or]: [{ email }, { phone }] },
      });
      if (existing) {
        return res
          .status(409)
          .json({ error: "User with this email or phone already exists." });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // --- MODIFIED: Geocode the itinerary details before the transaction ---
      const geocodedDetails = await geocodeItineraryDetails(itinerary.details);

      const result = await db.sequelize.transaction(async (t) => {
        // 1. Create the tourist
        const tourist = await Tourist.create(
          {
            name,
            email,
            password: hashedPassword,
            phone,
            nationality,
            kycId,
            emergencyContact,
            safetyScore: 100, // Default safety score
          },
          { transaction: t }
        );

        // 2. Create the single itinerary with geocoded details
        // FIX: Ensure the 'details' field is correctly assigned.
        await Itinerary.create(
          {
            touristId: tourist.id,
            tripName: itinerary.tripName,
            startDate: itinerary.startDate,
            endDate: itinerary.endDate,
            details: geocodedDetails, // The geocoded object is now correctly assigned
          },
          { transaction: t }
        );

        // 3. Register on blockchain
        const blockchainTxHash = await registerTouristOnBlockchain(tourist);

        // 4. Save the blockchain ID
        await BlockchainId.create(
          {
            touristId: tourist.id,
            blockchainAddress: blockchainTxHash,
          },
          { transaction: t }
        );

        return tourist;
      });

      const { id } = result;
      return res.status(201).json({
        message: "Tourist, itinerary, and blockchain ID created successfully.",
        touristId: id,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = registrationController;
