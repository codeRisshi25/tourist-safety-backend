const { Router } = require('express');
const authRoutes = require('./authRoutes.js');
const locationRoutes = require('./locationRoutes.js');

const router = Router();

router.use('/auth', authRoutes);
router.use('/location', locationRoutes);

module.exports = router;
