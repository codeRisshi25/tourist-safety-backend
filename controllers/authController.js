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

        // If it's the first time login, send a confirmation and don't issue a token yet
        if (tourist.isFirstTimeLogin) {
          return res.status(200).json({
            message: 'OTP verified. Please reset your password.',
            isFirstTimeLogin: true,
            touristId: tourist.id,
          });
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

  resetPassword: async (req, res, next) => {
    try {
      const { touristId, newPassword } = req.body;

      if (!touristId || !newPassword) {
        return res.status(400).json({ error: 'Tourist ID and new password are required.' });
      }

      const tourist = await Tourist.findByPk(touristId);
      if (!tourist) {
        return res.status(404).json({ error: 'Tourist not found.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await tourist.update({
        password: hashedPassword,
        isFirstTimeLogin: false,
      });

      res.status(200).json({ message: 'Password has been reset successfully.' });
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
      const { id, role } = req.user;

      let userProfile;
      if (role === 'tourist') {
        userProfile = await Tourist.findByPk(id, {
          attributes: { exclude: ['password'] }
        });
      } else if (role === 'authority') {
        userProfile = await Authority.findByPk(id, {
          attributes: { exclude: ['password'] }
        });
      }

      if (!userProfile) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(userProfile);
    } catch (error) {
      next(error);
    }
  },

  // --- GET SAFETY DETAILS FOR A TOURIST ---
  getSafetyDetails: async (req, res, next) => {
    try {
      const { touristId } = req.params;
      const { id: userId, role } = req.user;

      // Allow authorities or the tourist themselves
      if (role !== 'authority' && userId !== parseInt(touristId)) {
        return res.status(403).json({ error: 'Access denied.' });
      }

      const tourist = await Tourist.findByPk(touristId, {
        attributes: ['id', 'name', 'safetyDetails']
      });

      if (!tourist) {
        return res.status(404).json({ error: 'Tourist not found.' });
      }

      res.status(200).json({
        touristId: tourist.id,
        name: tourist.name,
        safetyDetails: tourist.safetyDetails
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
