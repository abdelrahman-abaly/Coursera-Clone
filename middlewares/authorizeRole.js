const authorizeRole = (roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.admin.role)) {
        return res.status(403).json({ msg: "Access denied" });
      }
      next();
    };
  };
  
  module.exports = authorizeRole;
  