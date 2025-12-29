const chechAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. Please login." });
  }
  console.log(req.user.role);
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. admin only." });
  }

  next();
};

module.exports = chechAdmin;
