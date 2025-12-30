const express = require("express");
const authmiddleware = require("../middleware/auth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
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
  const page = parseInt(req.query.page)
  const perpage = 5
  const allproduct = await Product.find().select("-description -seller -category -__v").lean().skip((page-1)*perpage).limit(perpage);
  const updateProduct =  allproduct.map((product)=>{
    const numberofReviews = product.review.length
    const sumofRating = product.review.reduce((sum,review)=> sum + review.rating, 0)
    const averageRating = sumofRating/(numberofReviews|| 1)
    return {
      ...product,
      images : product.images[0],
      review : {numberofReviews, averageRating},
    }
  })
  res.send(updateProduct);
})
router.delete("/:id", authmiddleware, async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) return res.status(404).json({ message: "Product not found!" });

  if (
    req.user.role !== "admin" &&
    req.user._id.toString() !== product.seller.toString()
  ) {
    return res.status(403).json({ message: "Not allowed!" });
  }

  //images deleted code remining 

  await product.deleteOne();
  res.json({ message: "Product deleted successfully!" });
});




router.get("/:id", async(req,res)=>{
  const id = req.params.id
  const product = await Product.findById(id).populate("seller", "_id name email").populate("review.user","_id name email")
  if(!product){
    return res.status(404).json({message:"Invalid product!"})
  }
  res.json({product});
})



module.exports = router;



// router.post("/",authmiddleware,checkSeller, (req,res)=>{
//   res.send("seller is here");
// })

// using one middleware using differnet role not write diff file 