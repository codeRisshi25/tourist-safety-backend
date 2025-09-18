const { Router } = require('express');
const authController = require('../controllers/authController.js');
const { authenticateToken } = require('../middleware/auth.js');

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
