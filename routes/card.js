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

router.get("/", authmiddleware, async (req, res) => {
  const userId = req.user._id;
  const cardData = await Card.findOne({ user: userId });
  if (!cardData) {
    res.status(404).json({ message: "User card is Empty!!" });
  }
  res.status(200).json(cardData);
});

router.patch("/increase/:productId", authmiddleware, async (req, res) => {
  const productId = req.params.productId;
  const userId = req.user._id;
  const product = await Product.findById(productId);
  if (!product) {
    return res.json({ message: "invalid product!" });
  }
  const card = await Card.findOne({ user: userId });
  if (!card) {
    res.json({ message: "card not avaibale" });
  }
  const index = card.products.findIndex(
    (p) => p.productId.toString() === productId
  );
  if (index === -1) {
    return res.json({ message: "invalid index or product !!" });
  }
  if (card.products[index].quantity >= product.stock) {
    return res.json({ message: "not increase by 1 || stock is end" });
  }
  card.products[index].quantity += 1;
  card.totalProduct += 1;
  card.totalCardPrice += product.price;

  await card.save();
  res.json({ message: "update succfully!", card });
});
router.patch("/decrease/:productId", authmiddleware, async (req, res) => {
  const productId = req.params.productId;
  const userId = req.user._id;
  const product = await Product.findById(productId);
  if (!product) {
    return res.json({ message: "invalid product!" });
  }
  const card = await Card.findOne({ user: userId });
  if (!card) {
    res.json({ message: "card not avaibale" });
  }
  const index = card.products.findIndex(
    (p) => p.productId.toString() === productId
  );
  if (index === -1) {
    return res.json({ message: "invalid index or product !!" });
  }
  if (card.products[index].quantity > 1) {
    card.products[index].quantity -= 1;
  } else {
    card.products.splice(index, 1);
  }

  card.totalProduct -= 1;
  card.totalCardPrice -= product.price;

  await card.save();
  res.json({ message: "update succfully!", card });
});
router.patch("/remove/:productId", authmiddleware, async (req, res) => {
  const productId = req.params.productId;
  const userId = req.user._id;
  const product = await Product.findById(productId);
  if (!product) {
    return res.json({ message: "invalid product!" });
  }
  const card = await Card.findOne({ user: userId });
  if (!card) {
    return res.json({ message: "card not avaibale" });
  }
  const index = card.products.findIndex(
    (p) => p.productId.toString() === productId
  );
  if (index === -1) {
    return res.json({ message: "invalid index or product !!" });
  }

  if (
    card.products.length === 1 &&
    card.products[index].productId.toString() === productId
  ) {
    await Card.findByIdAndDelete(card._id);
    return res.json({ message: "card are empty!!" });
  }
  const removedProduct = card.products[index];

  card.totalProduct -= removedProduct.quantity;
  card.totalCardPrice -= removedProduct.quantity * removedProduct.price;

  card.products.splice(index, 1);

  await card.save();
  res.json({ message: "Remove Succfully!!", card });
});

module.exports = router;
