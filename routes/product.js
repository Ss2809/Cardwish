const express = require("express");
const authmiddleware = require("../middleware/auth");
const multer = require("multer");
const checkRole = require("../middleware/chechRole");
const router = express.Router();
const Product = require("../models/products");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/Product");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});


router.post("/",authmiddleware,checkRole("seller"),upload.array("images", 8), async(req,res)=>{
  const {title,description,price,stock,category} = req.body;
  const images = req.files.map((image)=>image.filename);
  if(images.length === 0){
    return res.status(400).json({message : "At least one image add!!"})
  }
 const newProduct = new Product({
  title,
  description,
  price,
  stock,
  category,
  seller :req.user._id,
  images
 })
 await newProduct.save();
 res.status(201).json({newProduct});
})

router.get("/", async(req, res)=>{
  const allproduct = await Product.find();
  res.send(allproduct);
})
module.exports = router;



// router.post("/",authmiddleware,checkSeller, (req,res)=>{
//   res.send("seller is here");
// })

// using one middleware using differnet role not write diff file 