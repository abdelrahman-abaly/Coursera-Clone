const Admin = require('../models/Admin');
const EmailService = require('../services/emailService');
const { createJWT } = require('../utils/jwtUtils');

const adminAuthController = {
  // Register Admin (only superadmin can do this)
  registerAdmin: async (req, res) => {
    try {
      // Check if the requester is a superadmin
      if (req.userType !== 'admin' || req.user.role !== 'superadmin') {
        return res.status(403).json({ 
          message: 'Only superadmins can register new admins' 
        });
      }
      
      const { email, password, firstName, lastName, role } = req.body;
      
      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email });
      
      if (existingAdmin) {
        return res.status(400).json({ 
          message: 'Admin with this email already exists' 
        });
      }
      
      // reate new admin
      const admin = new Admin({
        email,
        password,
        firstName,
        lastName,
        role: role || 'admin' // Default to admin if not specified
      });
      
      // Generate verification token
      const verificationToken = admin.generateEmailVerificationToken();
      
      await admin.save();
      
      // Send verification email
      const emailService = new EmailService();
      await emailService.sendVerificationEmail(email, verificationToken, 'admin');
      
      res.status(201).json({
        message: 'Admin registered successfully. Verification email sent.',
        adminId: admin._id
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
  
  // Initialize First Superadmin (special route for first setup)
  initializeSuperAdmin: async (req, res) => {
    try {
      // Check if any admin exists
      const adminCount = await Admin.countDocuments();
      
      if (adminCount > 0) {
        return res.status(400).json({ 
          message: 'Superadmin already exists. Use the regular admin registration process.' 
        });
      }
      
      const { email, password, firstName, lastName } = req.body;
      
      // Create superadmin
      const superAdmin = new Admin({
        email,
        password,
        firstName,
        lastName,
        role: 'superadmin',
        isEmailVerified: true // Auto-verify first superadmin
      });
      
      await superAdmin.save();
      
      // Generate JWT
      const token = createJWT({ 
        id: superAdmin._id, 
        userType: 'admin', 
        role: 'superadmin' 
      });
      
      res.status(201).json({
        message: 'Superadmin initialized successfully',
        token,
        admin: {
          id: superAdmin._id,
          email: superAdmin.email,
          role: superAdmin.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

module.exports = adminAuthController;