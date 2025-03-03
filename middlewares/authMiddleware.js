// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Organization = require('../models/Organization');

// Verify JWT
const verifyJWT = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Authentication Middleware
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyJWT(token);

        if (!decoded) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        let user;

        // Check user type from the token
        if (decoded.userType === 'user') {
            user = await User.findById(decoded.id);
        } else if (decoded.userType === 'admin') {
            user = await Admin.findById(decoded.id);
        } else if (decoded.userType === 'organization') {
            user = await Organization.findById(decoded.id);
        }

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).json({
                message: 'Email not verified. Please verify your email to continue.'
            });
        }

        // Add user to request object
        req.user = user;
        req.userType = decoded.userType;
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Authorization Middleware - Role-based
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'You do not have permission to perform this action'
            });
        }

        next();
    };
};

module.exports = {
    authMiddleware,
    authorizeRoles
};