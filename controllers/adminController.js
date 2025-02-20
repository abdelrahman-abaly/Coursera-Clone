const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// register admin (only superadmin)
exports.registerAdmin = async (req, res) => {
  try {
    if (req.admin.role !== "superadmin") {
      return res.status(403).json({ msg1: "Only superadmin can add new admins" });
    }

    const { email, password, role } = req.body;

    if (role === "superadmin") {
      return res.status(403).json({ msg2: "You cannot create another superadmin." });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ msg3: "Admin already exists" });

    const newAdmin = new Admin({ email, password, role });
    await newAdmin.save();

    res.status(201).json({ msg4: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ error5: error.message });
  }
};

// login admin 
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ msg: "Invalid credentials1" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials2" });

    const accessToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: admin._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      // sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, role: admin.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// refresh token
exports.refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ msg: "Unauthorized" });

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ msg: "Invalid refresh token" });

    const newAccessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    res.json({ accessToken: newAccessToken });
  });
};

// logout
exports.logoutAdmin = (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ msg: "Logged out successfully" });
};


// forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ msg: "Admin not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    admin.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    admin.resetPasswordExpires = Date.now() + 3600000; 

    await admin.save();

    // send email 
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      to: admin.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset Request",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste it into your browser to complete the process:\n\n
        ${resetUrl}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ msg: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// reset password 
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, 
    });

    if (!admin) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    admin.password = password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;

    await admin.save();

    res.status(200).json({ msg: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


