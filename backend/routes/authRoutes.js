const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Get frontend URL from environment or default to localhost
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Google OAuth Routes
router.get('/google', (req, res, next) => {
  console.log('🚀 Google OAuth initiated from:', req.get('origin') || 'unknown');
  next();
}, passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  (req, res, next) => {
    console.log('🔙 Google OAuth callback received');
    console.log('Query params:', req.query);
    console.log('Error query param:', req.query.error);
    console.log('Code query param:', req.query.code);
    next();
  },
  (err, req, res, next) => {
    if (err) {
      console.error('❌ Google OAuth authentication error:', err.message);
      console.error('Error details:', err);
    }
    next();
  },
  passport.authenticate('google', { 
    failureRedirect: `${FRONTEND_URL}/login`,
    failureFlash: false 
  }),
  async (req, res) => {
    try {
      console.log('✅ Google OAuth successful, user authenticated');
      console.log('User ID:', req.user._id);
      console.log('User Email:', req.user.email);
      
      // Create JWT token for the authenticated user
      const payload = { 
        user: { 
          id: req.user._id, 
          role: req.user.role 
        } 
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '40h' });
      console.log('✅ JWT token created, redirecting to frontend');

      // Redirect to frontend with token
      res.redirect(`${FRONTEND_URL}/auth-success?token=${token}&user=${encodeURIComponent(JSON.stringify({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar
      }))}`);
    } catch (error) {
      console.error('❌ Error in Google callback:', error);
      res.redirect(`${FRONTEND_URL}/login?error=authentication_failed`);
    }
  }
);

// Logout route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user (for checking if user is logged in)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;

