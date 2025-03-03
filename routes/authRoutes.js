// Routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminAuthController = require('../controllers/adminAuthController');
const organizationAuthController = require('../controllers/organizationAuthController');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');

// User authentication routes
router.post('/register', authController.registerUser);
router.post('/login', authController.login);
router.get('/verify-email/:userType/:token', authController.verifyEmail);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password/:userType/:token', authController.resetPassword);
router.post('/resend-verification', authController.resendVerificationEmail);

// Admin-specific routes
router.post('/admin/register', authMiddleware, authorizeRoles('superadmin'), adminAuthController.registerAdmin);
router.post('/admin/init', adminAuthController.initializeSuperAdmin);

// Organization-specific routes
router.post('/organization/register', organizationAuthController.registerOrganization);
router.patch('/organization/:organizationId/approve', 
  authMiddleware, 
  authorizeRoles('admin', 'superadmin'), 
  organizationAuthController.approveOrganization
);

// Protected route example
router.get('/me', authMiddleware, (req, res) => {
  // Send user info based on userType
  res.status(200).json({
    user: req.user,
    userType: req.userType
  });
});

// Logout (client-side)
router.get('/logout', (req, res) => {
  res.status(200).json({ message: 'Logout successful. Please destroy the token on the client side.' });
});

module.exports = router;