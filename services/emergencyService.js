// Service for handling emergency (panic) activation

import prisma from "../prisma/client.js";

class EmergencyService {
  // Keep DB persistence available as an explicit helper if needed later.
  static async persistPanic(touristId, initialLocation) {
    const { latitude, longitude } = initialLocation;
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      throw new Error("latitude and longitude must be numbers");
    }

    return await prisma.$transaction(async (tx) => {
      const inserted = await tx.$queryRaw`
        INSERT INTO alert ("touristId", "alertType", status, location, "createdAt")
        VALUES (${touristId}, 'panic', 'active', ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), NOW())
        RETURNING *, ST_X(location) AS longitude, ST_Y(location) AS latitude
      `;
      return inserted[0];
    });
  }
}

export default EmergencyService;
