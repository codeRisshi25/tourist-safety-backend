const { Router } = require('express');
const authRoutes = require('./authRoutes.js');
const locationRoutes = require('./locationRoutes.js');
const sosRoutes = require('./sosRoutes.js');

const router = Router();

router.use('/auth', authRoutes);
router.use('/locations', locationRoutes); // Corrected from /location to /locations
router.use('/sos', sosRoutes);

module.exports = router;
