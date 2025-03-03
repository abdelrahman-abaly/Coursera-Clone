const crypto = require('crypto');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Organization = require('../models/Organization');
const EmailService = require('../services/emailService');
const { createJWT } = require('../Utils/jwtUtils');

const authController = {
  // Register User
  registerUser: async (req, res) => {
    try {
      const { username, firstName, lastName, email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }] 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'User with this email or username already exists' 
        });
      }
      
      // Create new user
      const user = new User({
        username,
        firstName,
        lastName,
        email,
        password
      });
      
      // Generate verification token
      const verificationToken = user.generateEmailVerificationToken();
      
      await user.save();
      
      // Send verification email
      const emailService = new EmailService();
      await emailService.sendVerificationEmail(email, verificationToken, 'user');
      
      res.status(201).json({
        message: 'User registered successfully. Please check your email to verify your account.',
        userId: user._id
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Verify Email
  verifyEmail: async (req, res) => {
    try {
      const { token, userType } = req.params;
      
      // Hash the token to compare with stored token
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      
      let user;
      
      // Find user by token based on user type
      if (userType === 'user') {
        user = await User.findOne({
          emailVerificationToken: hashedToken,
          emailVerificationExpires: { $gt: Date.now() }
        });
      } else if (userType === 'admin') {
        user = await Admin.findOne({
          emailVerificationToken: hashedToken,
          emailVerificationExpires: { $gt: Date.now() }
        });
      } else if (userType === 'organization') {
        user = await Organization.findOne({
          emailVerificationToken: hashedToken,
          emailVerificationExpires: { $gt: Date.now() }
        });
      } else {
        return res.status(400).json({ message: 'Invalid user type' });
      }
      
      if (!user) {
        return res.status(400).json({ 
          message: 'Invalid or expired verification token' 
        });
      }
      
      // Update user
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      
      await user.save();
      
      res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Login
  login: async (req, res) => {
    try {
      const { email, password, userType } = req.body;
      
      let user;
      
      // Find user by email based on user type
      if (userType === 'user') {
        user = await User.findOne({ email });
      } else if (userType === 'admin') {
        user = await Admin.findOne({ email });
      } else if (userType === 'organization') {
        user = await Organization.findOne({ email });
      } else {
        return res.status(400).json({ message: 'Invalid user type' });
      }
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check if email is verified
      if (!user.isEmailVerified) {
        return res.status(403).json({ 
          message: 'Email not verified. Please verify your email to log in.',
          userId: user._id
        });
      }
      
      // Update last login
      user.lastLogin = Date.now();
      await user.save();
      
      // Generate JWT
      const token = createJWT({ 
        id: user._id, 
        userType, 
        role: user.role 
      });
      
      // Return user info and token
      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          userType
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Request Password Reset
  requestPasswordReset: async (req, res) => {
    try {
      const { email, userType } = req.body;
      
      let user;
      
      // Find user by email based on user type
      if (userType === 'user') {
        user = await User.findOne({ email });
      } else if (userType === 'admin') {
        user = await Admin.findOne({ email });
      } else if (userType === 'organization') {
        user = await Organization.findOne({ email });
      } else {
        return res.status(400).json({ message: 'Invalid user type' });
      }
      
      if (!user) {
        return res.status(404).json({ message: 'User not found with this email' });
      }
      
      // Generate reset token
      const resetToken = user.generatePasswordResetToken();
      await user.save();
      
      // Send password reset email
      const emailService = new EmailService();
      await emailService.sendPasswordResetEmail(email, resetToken, userType);
      
      res.status(200).json({ 
        message: 'Password reset email sent. Please check your email.' 
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Reset Password
  resetPassword: async (req, res) => {
    try {
      const { token, userType } = req.params;
      const { password } = req.body;
      
      // Hash the token to compare with stored token
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      
      let user;
      
      // Find user by token based on user type
      if (userType === 'user') {
        user = await User.findOne({
          resetPasswordToken: hashedToken,
          resetPasswordExpires: { $gt: Date.now() }
        });
      } else if (userType === 'admin') {
        user = await Admin.findOne({
          resetPasswordToken: hashedToken,
          resetPasswordExpires: { $gt: Date.now() }
        });
      } else if (userType === 'organization') {
        user = await Organization.findOne({
          resetPasswordToken: hashedToken,
          resetPasswordExpires: { $gt: Date.now() }
        });
      } else {
        return res.status(400).json({ message: 'Invalid user type' });
      }
      
      if (!user) {
        return res.status(400).json({ 
          message: 'Invalid or expired reset token' 
        });
      }
      
      // Update user password
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      
      await user.save();
      
      res.status(200).json({ message: 'Password reset successful. You can now log in with your new password.' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Resend Verification Email
  resendVerificationEmail: async (req, res) => {
    try {
      const { userId, userType } = req.body;
      
      let user;
      
      // Find user by ID based on user type
      if (userType === 'user') {
        user = await User.findById(userId);
      } else if (userType === 'admin') {
        user = await Admin.findById(userId);
      } else if (userType === 'organization') {
        user = await Organization.findById(userId);
      } else {
        return res.status(400).json({ message: 'Invalid user type' });
      }
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      if (user.isEmailVerified) {
        return res.status(400).json({ message: 'Email already verified' });
      }
      
      // Generate new verification token
      const verificationToken = user.generateEmailVerificationToken();
      await user.save();
      
      // Send verification email
      const emailService = new EmailService();
      await emailService.sendVerificationEmail(user.email, verificationToken, userType);
      
      res.status(200).json({ 
        message: 'Verification email sent. Please check your email.' 
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = authController;