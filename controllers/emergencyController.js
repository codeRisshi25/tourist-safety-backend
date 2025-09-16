// Controller for handling emergency activation

import { getIo } from "../socket/socketService.js";

class EmergencyController {
  // Handle POST /activate for panic alert.

  static async activateEmergency(req, res) {
    try {
      const touristId = req.tourist.id;
      const { latitude, longitude } = req.body;
      if (
        typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        !touristId
      ) {
        return res.status(400).json({ error: "Missing or invalid parameters" });
      }
      // Per requirements: do not persist emergency to DB; emit to authorities only
      const io = getIo();
      if (io) {
        io.to("authorities").emit("emergency:update", {
          touristId,
          latitude,
          longitude,
          timestamp: new Date(),
        });
        return res
          .status(200)
          .json({ message: "Panic alert emitted to authorities" });
      } else {
        // Fallback: if IO not available, log and return server error
        console.error(
          "Socket IO not initialized - cannot emit emergency update"
        );
        return res.status(500).json({ error: "Real-time service unavailable" });
      }
    } catch (err) {
      console.error("Emergency activation error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

export default EmergencyController;
