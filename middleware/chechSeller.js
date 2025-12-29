const checkSeller = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. Please login." });
  }
  //console.log(req.user.role);
  if (req.user.role !== "seller") {
    return res.status(403).json({ message: "Access denied. Seller only." });
  }

  next();
};

module.exports = checkSeller;
