import { pointInPolygon } from '../utils/geo.js';
import { getCoordinatesForLocation } from './geo/geocodingService.js';
import { Itinerary, GeofencedZone } from '../models';

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

  const riskZones = await GeofencedZone.findAll();

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

  const itineraryRecord = await Itinerary.create({
    tripName: data.trip_name,
    startDate: data.start_date,
    endDate: data.end_date,
    safetyScore: safety_score,
    details: { locations: geocodedLocations }
  });

  return itineraryRecord;
}

export default { createItinerary };
