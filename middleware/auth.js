const jwt = require("jsonwebtoken");
const user = require("../models/user");

const authmiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  //console.log(authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization Token required!" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decodedUser = jwt.verify(token, process.env.JWT_KEY);
    req.user = decodedUser;
   // console.log(req.user );
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid Token !" });
  }
};

module.exports = authmiddleware;
