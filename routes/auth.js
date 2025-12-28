const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
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

    const { accestoken, refreshtoken } = creattokens({
      _id: user._id,
      name: user.name,
    });
    //const hashbasedtoken  = await bcrypt.hash(refreshtoken,10);
    user.refreshtoken = refreshtoken;
    await user.save();
    res.cookie("refreshtoken", refreshtoken, {
      httpOnly: true,
      secure: false, //true in dev mode
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    //res.redirect(`http://localhost:5173/dashbaord?token=${token}`)
    res.json(accestoken);
  }
);

router.post("/refresh", async (req, res) => {
  const userrefreshtoken = req.cookies.refreshtoken;
  if (!userrefreshtoken) {
    return res.status(401).json({ message: "no refresh token " });
  }
  let decodeduser;
  try {
    decodeduser = jwt.verify(
      userrefreshtoken,
      process.env.JWT_KEY_REFERSH_TOKEN
    );
  } catch (error) {
    res.status(403).json({ message: "invalid refresh token" });
  }
  const user = await User.findById(decodeduser._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const isvalid = await bcrypt.compare(userrefreshtoken, user.refreshtoken);
  if (!isvalid) {
    res.json({ message: "refresh token is not valid" });
  }
  const { accestoken, refreshtoken } = creattokens({
    _id: user._id,
    name: user.name,
  });
  //const hashbasedtoken  = await bcrypt.hash(refreshtoken,10);
  user.refreshtoken = refreshtoken;
  await user.save();
  res.cookie("refreshtoken", refreshtoken, {
    httpOnly: true,
    secure: false, //true in dev mode
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json(accestoken);
});

router.post("/logout", async (req, res) => {
  const userrefreshtoken = req.cookies.refreshtoken;
  if (!userrefreshtoken) {
    return res.status(401).json({ message: "no refresh token " });
  }
  let decodeduser;
  try {
    decodeduser = jwt.verify(
      userrefreshtoken,
      process.env.JWT_KEY_REFERSH_TOKEN
    );
  } catch (error) {
    res.status(403).json({ message: "invalid refresh token" });
  }
  const user = await User.findById(decodeduser._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  res.clearCookie("refreshtoken", {
    httpOnly: true,
    secure: false, //true in dev mode
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ message: "logout succfully!!" });
});

const creattokens = (data) => {
  const accestoken = jwt.sign(data, process.env.JWT_KEY_ACCES_TOKEN, {
    expiresIn: "5m",
  });
  const refreshtoken = jwt.sign(
    { _id: data._id },
    process.env.JWT_KEY_REFERSH_TOKEN,
    {
      expiresIn: "7d",
    }
  );
  return { accestoken, refreshtoken };
};
module.exports = router;
