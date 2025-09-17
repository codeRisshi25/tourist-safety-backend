import itineraryService from '../services/itineraryService.js';
import { Itinerary } from '../models';

const createItinerary = async (req, res, next) => {
  try {
    const itinerary = await itineraryService.createItinerary({
      ...req.body,
      touristId: req.user.id,
    });
    res.status(201).json(itinerary);
  } catch (error) {
    next(error);
  }
};

const getItineraries = async (req, res, next) => {
  try {
    const itineraries = await Itinerary.findAll({ where: { touristId: req.user.id } });
    res.json(itineraries);
  } catch (error) {
    next(error);
  }
};

const getItineraryById = async (req, res, next) => {
  try {
    const itinerary = await Itinerary.findOne({
      where: { id: req.params.id, touristId: req.user.id },
    });
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }
    res.json(itinerary);
  } catch (error) {
    next(error);
  }
};

export default {
  createItinerary,
  getItineraries,
  getItineraryById,
};

