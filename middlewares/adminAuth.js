const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
  const token = req.cookies.token || req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ msg: "Unauthorized" });
  }
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = verified;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

module.exports = adminAuth;
