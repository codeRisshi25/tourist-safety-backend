const db = require("../models/index.js");
const { Tourist, Authority, Itinerary, BlockchainId } = db; // Added BlockchainId
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const {
  registerTouristOnBlockchain,
} = require("../service/blockchainService.js"); // Import the service

const registrationController = {
  // ----REGISTER A NEW TOURIST ----
  registerTourist: async (req, res, next) => {
    try {
      const { role } = req.user;
      if (role !== "admin") {
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
        itineraries,
      } = req.body;

      // Require itineraries for creating a tourist
      if (!Array.isArray(itineraries) || itineraries.length === 0) {
        return res
          .status(400)
          .json({ error: "Itineraries are required to create a tourist." });
      }

      // Basic validation
      if (!name || !email || !password) {
        return res.status(400).json({
          error: "Missing required tourist fields: name, email or password.",
        });
      }

      // Prevent huge payloads
      if (itineraries.length > 200) {
        return res
          .status(413)
          .json({ error: "Too many itineraries in one request." });
      }

      // Check existing user
      const existing = await Tourist.findOne({
        where: {
          [Op.or]: [{ email }, { phone }],
        },
      });
      if (existing) {
        return res
          .status(409)
          .json({ error: "User with this email or phone number already exists." });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Atomic create tourist, itineraries, and blockchain ID
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
          },
          { transaction: t }
        );

        // 2. Create the itineraries
        const rows = itineraries.map((it) => ({
          touristId: tourist.id,
          tripName: it.tripName || it.trip_name || it.trip || null,
          startDate: it.startDate || it.start_date || it.start || null,
          endDate: it.endDate || it.end_date || it.end || null,
          details: it.details || it.days || null,
        }));

        await Itinerary.bulkCreate(rows, { transaction: t });

        // 3. Register on blockchain and get the transaction hash
        const blockchainTxHash = await registerTouristOnBlockchain(tourist);

        // 4. Save the blockchain ID to the database
        await BlockchainId.create(
          {
            touristId: tourist.id,
            blockchainAddress: blockchainTxHash,
          },
          { transaction: t }
        );

        return tourist;
      });

      // Do not return password
      const { id } = result;
      return res.status(201).json({
        message: "Tourist, itineraries, and blockchain ID created successfully.",
        touristId: id,
      });
    } catch (err) {
      // The transaction will automatically roll back on error
      next(err);
    }
  },
  // ...existing code...
};

module.exports = registrationController;