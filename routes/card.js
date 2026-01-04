const express = require("express");
const authmiddleware = require("../middleware/auth");
const Product = require("../models/products");
const Card = require("../models/card");
const router = express.Router();

router.post("/:id", authmiddleware, async (req, res) => {
  const { quantity } = req.body;
  const productId = req.params.id.trim();
  const userId = req.user._id;

  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({ message: "product not found!!" });
  }
  if (product.stock < quantity) {
    res.status(400).json({ message: "stock less then quantity" });
  }

  let card = await Card.findOne({ user: userId });
  //console.log(card);
  if (!card) {
    card = new Card({
      user: userId,
      products: [],
      totalProduct: 0,
      totalCardPrice: 0,
    });
  }

  const existingProduct = card.products.find(
    (p) => p.productId.toString() === productId
  );

  if (existingProduct) {
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock" });
    }
    existingProduct.quantity += quantity;
  } else {
    card.products.push({
      productId,
      quantity,
      title: product.title,
      price: product.price,
      image: product.images[0],
    });
  }

  card.totalProduct += quantity;
  card.totalCardPrice += product.price * quantity;

  await card.save();

  res.status(201).json({ message: "Product added to cart", card });
});

module.exports = router;
