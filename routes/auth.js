const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:5173/login",
  }),
  async (req, res) => {
    const profile = req.user;
    let user = await User.findOne({
      $or: [{ gogleId: profile.id }, { email: profile.emails[0].value }],
    });
    if (user) {
      if (!user.gogleId) {
        user.gogleId = profile.id;
        await user.save();
      }
    } else {
      user = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        gogleId: profile.id,
      });
      await user.save();
    }

    const token = jwt.sign(
      { _id: user._id, name: user.name },
      process.env.JWT_KEY,
      { expiresIn: "2h" }
    ); 
    //res.redirect(`http://localhost:5173/dashbaord?token=${token}`)
    res.json(token);
  }
);

module.exports = router;
