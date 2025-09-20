const { Location, Tourist } = require('../models');

const addLocation = async (req, res) => {
  const { latitude, longitude, touristId } = req.body;
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
    res.status(201).json(location);
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
