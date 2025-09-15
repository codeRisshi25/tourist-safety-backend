import { createItinerary } from '../services/itineraryService.js';

export async function postItinerary(req, res) {
  try {
    const itinerary = await createItinerary(req.body);
    res.status(201).json({ success: true, itinerary });
  } catch (e) {
    res.status(400).json({ success: false, error: e.message });
  }
}

export default { postItinerary };

