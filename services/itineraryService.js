import { readJson, writeJson } from '../utils/jsonDb.js';
import { pointInPolygon } from '../utils/geo.js';
import { getCoordinatesForLocation } from './geo/geocodingService.js';

function validateItineraryPayload(body) {
  const requiredRoot = ['trip_name', 'start_date', 'end_date', 'days'];
  for (const key of requiredRoot) {
    if (!(key in body)) throw new Error(`Missing field: ${key}`);
  }
  if (!Array.isArray(body.days) || body.days.length === 0) {
    throw new Error('Days must be a non-empty array');
  }
  body.days.forEach((dayObj, idx) => {
    if (typeof dayObj.day !== 'number') throw new Error(`Day index ${idx} missing numeric 'day'`);
    if (!Array.isArray(dayObj.locations) || dayObj.locations.length === 0) {
      throw new Error(`Day ${dayObj.day} must include locations array`);
    }
  });
}

function computeSafetyScore(geocodedLocations, riskZones) {
  let score = 100;
  for (const loc of geocodedLocations) {
    for (const zone of riskZones) {
      if (pointInPolygon({ latitude: loc.latitude, longitude: loc.longitude }, zone.polygon)) {
        const deduction = zone.is_restricted ? 50 : zone.risk_level * 2;
        score -= deduction;
      }
    }
  }
  if (score < 0) score = 0;
  return score;
}

export async function createItinerary(data) {
  validateItineraryPayload(data);

  const riskZones = readJson('riskZones.json');
  const itineraries = readJson('itineraries.json');

  const geocodedLocations = [];

  for (const day of data.days) {
    for (const loc of day.locations) {
      try {
        const coords = await getCoordinatesForLocation(loc.name);
        if (!coords) {
          throw new Error(`Location '${loc.name}' not found.`);
        }
        geocodedLocations.push({
          day: day.day,
            name: loc.name,
            latitude: coords.latitude,
            longitude: coords.longitude
        });
      } catch (e) {
        throw new Error(e.message || `Failed geocoding ${loc.name}`);
      }
    }
  }

  const safety_score = computeSafetyScore(geocodedLocations, riskZones);
  const newId = itineraries.length ? Math.max(...itineraries.map(i => i.id || 0)) + 1 : 1;

  const itineraryRecord = {
    id: newId,
    trip_name: data.trip_name,
    start_date: data.start_date,
    end_date: data.end_date,
    safety_score,
    locations: geocodedLocations
  };

  itineraries.push(itineraryRecord);
  writeJson('itineraries.json', itineraries);

  return itineraryRecord;
}

export default { createItinerary };
