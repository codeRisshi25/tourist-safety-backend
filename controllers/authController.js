const db = require('../models/index.js');
const { Tourist } = db;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  // --- REGISTER A NEW USER ---
  register: async (req, res, next) => {
    try {
      const { fullName, phoneNumber, email, password , nationality , } = req.body;

      if (!fullName || !phoneNumber || !password || !email) {
        return res.status(400).json({ error: 'All fields are required.' });
      }

      // Check if user already exists
      const existingUser = await Tourist.findOne({
        where: { OR: [{ email }, { phoneNumber }] },
      });

      if (existingUser) {
        return res.status(409).json({ error: 'User with this email or phone number already exists.' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      const tourist = await Tourist.create({
        fullName,
        phoneNumber,
        email,
        password: hashedPassword,
      });

      res.status(201).json({ message: 'Tourist registered successfully', tourist });
    } catch (error) {
      next(error);
    }
  },

  // --- LOGIN A USER ---
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const tourist = await Tourist.findOne({ where: { email } });

      if (!tourist) {
        return res.status(401).json({ error: 'Authentication failed' });
      }

      const isPasswordValid = await bcrypt.compare(password, tourist.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Authentication failed' });
      }

      // Generate tokens
      const token = jwt.sign({ id: tourist.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.json({ message: 'Logged in successfully', token });
    } catch (error) {
      next(error);
    }
  },

  // --- GET USER PROFILE ---
  getProfile: async (req, res, next) => {
    try {
      const tourist = await Tourist.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
      });
      res.json(tourist);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
