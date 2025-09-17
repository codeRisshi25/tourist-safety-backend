// Service for handling location pings using raw PostGIS queries

import { LocationPing } from '../models';

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

    const location = {
      type: 'Point',
      coordinates: [longitude, latitude],
      crs: { type: 'name', properties: { name: 'EPSG:4326' } }
    };

    const result = await LocationPing.create({
      touristId,
      location,
      accuracyMeters,
      speedMps,
      timestamp,
    });

    return result;
  }
}

export default LocationService;
