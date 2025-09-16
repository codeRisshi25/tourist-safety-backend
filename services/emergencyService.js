// Service for handling emergency (panic) activation

import prisma from "../prisma/client.js";

class EmergencyService {
  // Keep DB persistence available as an explicit helper if needed later.
  static async persistPanic(touristId, initialLocation) {
    const { latitude, longitude } = initialLocation;
    const point = `SRID=4326;POINT(${longitude} ${latitude})`;

    return await prisma.$transaction(async (tx) => {
      const query = `
        INSERT INTO alert ("touristId", "alertType", status, location, "createdAt")
        VALUES ($1, 'panic', 'active', ST_GeomFromText($2), NOW())
        RETURNING *
      `;
      const params = [touristId, point];
      const result = await tx.$queryRawUnsafe(query, ...params);
      return result[0];
    });
  }
}

export default EmergencyService;
