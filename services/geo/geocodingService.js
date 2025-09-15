import geocoder from '../../config/geocoder.js';

// Simple in-memory cache (can be replaced by Redis later)
const cache = new Map(); // key: original locationName lowercased, value: { latitude, longitude }

export async function getCoordinatesForLocation(locationName) {
  if (!locationName || typeof locationName !== 'string') {
    throw new Error('Invalid location name');
  }
  const key = locationName.trim().toLowerCase();
  if (cache.has(key)) {
    return cache.get(key);
  }
  const searchQuery = `${locationName}, Assam, India`;
  try {
    const results = await geocoder.geocode(searchQuery);
    if (!results || results.length === 0) {
      throw new Error(`Location "${locationName}" could not be found in Assam.`);
    }
    const best = results[0];
    const value = { latitude: best.latitude, longitude: best.longitude };
    cache.set(key, value);
    return value;
  } catch (err) {
    throw err;
  }
}

export default { getCoordinatesForLocation };
