const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const user = require("../models/user");
const authmiddleware = require("../middleware/auth");

const createuserSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().lowercase().required(),
  password: Joi.string().min(6).required(),
  deliveryAddress: Joi.string().min(5).required(),
});

router.post("/", async (req, res) => {
  const { name, email, password, deliveryAddress } = req.body;

  const joinvalider = createuserSchema.validate(req.body);
  if (joinvalider.error) {
    return res.status(400).json(joinvalider.error.details[0].message);
  }
  const check = await user.findOne({ email: email });

  if (check) {
    return res.status(400).json({ message: "User all ready exits!" });
  }
  const hashpassword = await bcrypt.hash(password, 10);
  const newuser = new user({
    name,
    email,
    password: hashpassword,
    deliveryAddress,
  });
  await newuser.save();
  const jwttoken = creattoken({ _id: newuser._id, name: newuser.name });

  res.status(201).json(jwttoken);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const person = await user.findOne({ email: email });
  if (!person) {
    return res.status(401).json({ message: "Invalid User!" });
  }

  const validatepassword = await bcrypt.compare(password, person.password);
  if (!validatepassword) {
    return res.status(401).json({ message: "Invalid User!" });
  }
  const jwttoken = creattoken({ _id: person._id, name: person.name });
  res.json({ jwttoken });
});

router.post("/in", authmiddleware, async (req, res) => {
  console.log(req.user);
  const userData = await user.findById(req.user._id).select("-password");
  res.json(userData);
});
const creattoken = (data) => {
  return jwt.sign(data, process.env.JWT_KEY, { expiresIn: "2h" });
};

module.exports = router;
