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

    // Basic validation
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      throw new Error("latitude and longitude must be numbers");
    }

    // Use ST_SetSRID(ST_MakePoint(lon, lat), 4326) with parameterized template
    // Return numeric coordinates (ST_X/ST_Y) which are easier for clients to consume
    const result = await prisma.$queryRaw`
      INSERT INTO location_ping ("touristId", location, "accuracyMeters", "speedMps", "timestamp")
      VALUES (${touristId}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326), ${
      accuracyMeters ?? null
    }, ${speedMps ?? null}, ${timestamp})
      RETURNING id, ST_X(location) AS longitude, ST_Y(location) AS latitude
    `;

    // prisma.$queryRaw tagged templates return an array of rows
    return result[0];
  }
}

export default LocationService;
