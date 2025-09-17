import { Router } from 'express';
import authRoutes from './authRoutes.js';
import emergencyRoutes from './emergencyRoutes.js';
import itineraryRoutes from './itineraryRoutes.js';
import locationRoutes from './locationRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/emergency', emergencyRoutes);
router.use('/itineraries', itineraryRoutes);
router.use('/location', locationRoutes);

export default router;
