// Controller for handling location ping requests

import LocationService from "../services/locationService.js";

class LocationController {
  
    // Handle POST /ping for location updates.
   
  static async handleLocationPing(req, res) {
    try {
      const { latitude, longitude, accuracy, speed, timestamp } = req.body;
      const touristId = req.tourist.id;
      if (
        typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        !touristId
      ) {
        return res.status(400).json({ error: "Missing or invalid parameters" });
      }
      await LocationService.createLocationPing({
        touristId,
        latitude,
        longitude,
        accuracyMeters: accuracy,
        speedMps: speed,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      });
      return res.status(202).json({ message: "Location ping accepted" });
    } catch (err) {
      console.error("Location ping error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default LocationController;
