import express from 'express';
import exampleController from '../controllers/exampleController.js';
import itineraryController from '../controllers/itineraryController.js';

const router = express.Router();

router.get('/example', exampleController.getExample);
router.post('/itineraries', itineraryController.postItinerary);

export default router;
