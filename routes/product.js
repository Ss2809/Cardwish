const express = require("express");
const authmiddleware = require("../middleware/auth");
const checkSeller = require("../middleware/chechSeller");
const router = express.Router();

router.post("/",authmiddleware,checkSeller, (req,res)=>{
  res.send("seller is here");
})

module.exports = router;
