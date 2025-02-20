const express = require("express");
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { registerAdmin, loginAdmin, refreshToken, logoutAdmin ,forgotPassword, resetPassword} = require("../controllers/adminController");
const adminAuth = require("../middlewares/adminAuth");
const authorizeRole = require("../middlewares/authorizeRole");

const router = express.Router();
router.post("/createSuperadmin", async (req, res) => {
    try {
        const existingSuperadmin = await Admin.findOne({ role: "superadmin" });
        if (existingSuperadmin) {
            return res.status(400).json({ msg: "Superadmin already exists" });
        }

        // const hashedPassword = await bcrypt.hash("abaly123", 10);

        const superadmin = new Admin({
            email: "ably@gmail.com",
            // password: hashedPassword,
            password: "abaly123",
            role: "superadmin",
        });

        await superadmin.save();
        res.json({ msg: "Superadmin created successfully", email: superadmin.email });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/login", loginAdmin);
router.post("/refresh-token", refreshToken);
router.post("/logout", adminAuth, logoutAdmin);

router.post("/register", adminAuth, authorizeRole(["superadmin"]), registerAdmin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
