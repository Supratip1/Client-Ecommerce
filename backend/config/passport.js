const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Debug: Log environment variables
console.log('=== GOOGLE OAUTH INITIALIZATION ===');
console.log('BACKEND_URL:', process.env.BACKEND_URL || 'NOT SET');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'EXISTS' : '❌ MISSING');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'EXISTS' : '❌ MISSING');

// Build callback URL
const callbackURL = process.env.BACKEND_URL 
  ? `${process.env.BACKEND_URL}/api/auth/google/callback` 
  : "http://localhost:3000/api/auth/google/callback";

console.log('✅ Using callbackURL:', callbackURL);
console.log('==============================');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('🔔 Google OAuth callback triggered!');
      console.log('Profile ID:', profile.id);
      console.log('Profile Email:', profile.emails[0].value);
      
      // Check if user already exists
      let existingUser = await User.findOne({ googleId: profile.id });
      
      if (existingUser) {
        console.log('✅ Found existing user by googleId');
        return done(null, existingUser);
      }
      
      // Check if user exists with same email
      existingUser = await User.findOne({ email: profile.emails[0].value });
      
      if (existingUser) {
        console.log('✅ Found existing user by email, updating with googleId');
        // Update existing user with Google ID
        existingUser.googleId = profile.id;
        // Store Google profile picture with a more reliable URL
        existingUser.avatar = profile.photos[0].value.replace('s96-c', 's200-c').replace('=s96-c', '=s200-c');
        await existingUser.save();
        return done(null, existingUser);
      }
      
      console.log('📝 Creating new user');
      // Create new user
      const newUser = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        // Store Google profile picture with a more reliable URL
        avatar: profile.photos[0].value.replace('s96-c', 's200-c').replace('=s96-c', '=s200-c'),
        role: 'customer'
      });
      
      await newUser.save();
      console.log('✅ New user created successfully');
      return done(null, newUser);
    } catch (error) {
      console.error('❌ Error in Google OAuth callback:', error);
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
