// Service for handling location pings using raw PostGIS queries

import prisma from "../prisma/client.js";

class LocationService {
  static async createLocationPing(data) {
    const {
      touristId,
      latitude,
      longitude,
      accuracyMeters,
      speedMps,
      timestamp,
    } = data;

    const point = `SRID=4326;POINT(${longitude} ${latitude})`;

    // Use raw SQL to insert geospatial data with camelCase field names
    const query = `
      INSERT INTO location_ping ("touristId", location, "accuracyMeters", "speedMps", "timestamp")
      VALUES ($1, ST_GeomFromText($2), $3, $4, $5)
      RETURNING id
    `;

    const params = [
      touristId,
      point,
      accuracyMeters ?? null,
      speedMps ?? null,
      timestamp,
    ];

    const result = await prisma.$queryRawUnsafe(query, ...params);
    return result[0];
  }
}

export default LocationService;
