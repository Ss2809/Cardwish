const express = require("express");
const routes = express.Router();
const multer = require("multer");
const Catgories = require("../models/catgories");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "upload/Catgories");
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

routes.post("/catgories", upload.single("icon"), async (req, res) => {
  if (!req.body.name || !req.file) {
    return res.status(400).json({ message: "name and icon are requird!!" });
  }

  const newCatgories = new Catgories({
    name: req.body.name,
    image: req.file.filename,
  });
  await newCatgories.save();
  res.status(201).json({ message: "Catgories added succfully!!" });
});

module.exports = routes;
