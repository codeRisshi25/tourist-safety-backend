const db = require('../models/index.js');
const { Tourist , Authority } = db;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const authController = {
  // --- REGISTER A NEW USER ---
  register: async (req, res, next) => {
    try {
      const { name, phone, email, password, nationality, kycId, emergencyContact } = req.body;

      if (!name || !phone || !password || !email) {
        return res.status(400).json({ error: 'Name, phone, email, and password are required.' });
      }

      // Check if user already exists
      const existingUser = await Tourist.findOne({
        where: { [Op.or]: [{ email }, { phone }] },
      });

      if (existingUser) {
        return res.status(409).json({ error: 'User with this email or phone number already exists.' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      const tourist = await Tourist.create({
        name,
        phone,
        email,
        password: hashedPassword,
        nationality,
        kycId,
        emergencyContact
      });

      // Exclude password from the response
      const touristData = tourist.get({ plain: true });
      delete touristData.password;

      res.status(201).json({ message: 'Tourist registered successfully', tourist: touristData });
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

      // Try to find a Tourist first
      const tourist = await Tourist.findOne({ where: { email } });

      if (tourist) {
        const isPasswordValid = await bcrypt.compare(password, tourist.password);
        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Authentication failed' });
        }

        const token = jwt.sign({ id: tourist.id, role: 'tourist' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000
        });

        return res.json({ message: 'Tourist logged in successfully' });
      }

      // If not a Tourist, try Authority
      const authority = await Authority.findOne({ where: { email } });
      if (authority) {
        const isPasswordValid = await bcrypt.compare(password, authority.password);
        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Authentication failed' });
        }

        const token = jwt.sign({ id: authority.id, role: 'authority' }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 24 * 60 * 60 * 1000
        });

        return res.json({ message: 'Authority logged in successfully' });
      }

      // No user found
      return res.status(401).json({ error: 'Authentication failed' });
        } catch (error) {
      next(error);
    }
  },

  // --- LOGOUT A USER ---
  logout: (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
  },


  // --- GET USER PROFILE ---
  getProfile: async (req, res, next) => {
    try {
      // The user ID is attached to req by the auth middleware
      const tourist = await Tourist.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
      });
      if (!tourist) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(tourist);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
