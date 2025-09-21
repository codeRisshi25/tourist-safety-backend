const { Location, Tourist, Zone } = require('../models');

const addLocation = async (req, res) => {
  const { latitude, longitude, touristId } = req.body;

  // Validate input
  if (latitude == null || longitude == null || !touristId) {
    return res.status(400).json({ error: 'latitude, longitude and touristId are required' });
  }

  try {
    const tourist = await Tourist.findByPk(touristId);
    if (!tourist) {
      return res.status(404).json({ error: 'Tourist not found' });
    }

    const location = await Location.create({
      latitude,
      longitude,
      touristId,
    });

    // Load geofenced zones
    const zones = await Zone.findAll({ where: { type: 'geofenced' } });

    // Haversine formula to compute distance in meters
    const toRad = (deg) => (deg * Math.PI) / 180;
    const haversineDistanceMeters = (lat1, lon1, lat2, lon2) => {
      const R = 6371000; // Earth radius in meters
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const matchedZones = [];
    for (const z of zones) {
      const zoneLat = parseFloat(z.lat);
      const zoneLng = parseFloat(z.lng);
      const zoneRadiusMeters = parseFloat(z.radius) * 1000; // if radius stored in km; adjust if in meters

      const distance = haversineDistanceMeters(
        parseFloat(latitude),
        parseFloat(longitude),
        zoneLat,
        zoneLng
      );

      if (distance <= zoneRadiusMeters) {
        matchedZones.push({
          id: z.id,
          name: z.name,
          distanceMeters: distance,
          radiusMeters: zoneRadiusMeters,
        });
      }
    }

    const response = {
      location,
      geofenceWarning: matchedZones.length > 0,
      matchedZones,
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLastLocation = async (req, res) => {
  const { touristId } = req.params;
  try {
    const tourist = await Tourist.findByPk(touristId);
    if (!tourist) {
      return res.status(404).json({ error: 'Tourist not found' });
    }
    const location = await Location.findOne({
      where: { touristId },
      order: [['createdAt', 'DESC']],
    });
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addLocation,
  getLastLocation,
};
