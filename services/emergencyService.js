// Service for handling emergency (panic) activation

import { Alert } from '../models';

class EmergencyService {
  // Keep DB persistence available as an explicit helper if needed later.
  static async persistPanic(touristId, initialLocation) {
    const { latitude, longitude } = initialLocation;
    const location = {
      type: 'Point',
      coordinates: [longitude, latitude],
      crs: { type: 'name', properties: { name: 'EPSG:4326' } }
    };

    return await Alert.create({
      touristId,
      alertType: 'panic',
      status: 'active',
      location
    });
  }
}

export default EmergencyService;
