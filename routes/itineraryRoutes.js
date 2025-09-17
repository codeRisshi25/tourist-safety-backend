import { Router } from 'express';
import itineraryController from '../controllers/itineraryController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, itineraryController.createItinerary);
router.get('/', authenticateToken, itineraryController.getItineraries);
router.get('/:id', authenticateToken, itineraryController.getItineraryById);

export default router;
