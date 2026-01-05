const express = require("express");
const Razorpay = require("razorpay");
const authmiddleware = require("../middleware/auth");
const Cart = require("../models/card");
const crypto = require("crypto");
const Order = require("../models/order");
const Card = require("../models/card");
const checkRole = require("../middleware/chechRole");
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.Razorpay_key_id,
  key_secret: process.env.Razorpay_key_secret,
});

router.post("/create-order", authmiddleware, async (req, res) => {
  const { shippingAddress } = req.body;
  if (!shippingAddress) {
    return res.json({ message: "shippingAddress is required!!" });
  }
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart || cart.products.length === 0) {
    return res.status(404).json({ message: "Cart empty" });
  }

  const options = {
    amount: cart.totalCardPrice * 100,
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);
  res.json(order); // 🔥 frontend will now receive amount & id
});

router.post("/verify", authmiddleware, async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    shippingAddress,
  } = req.body;
  if (!shippingAddress) {
    return res.json({ message: "shippingAddress is required!!" });
  }
  // console.log({shippingAddress})
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.Razorpay_key_secret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Payment failed" });
  }

  const cart = await Cart.findOne({ user: req.user._id });

  const newOrder = new Order({
    user: req.user._id,
    products: cart.products,
    totalPrice: cart.totalCardPrice,
    shippingAddress: shippingAddress,
    totalProduct: cart.totalProduct,
    paymentStatus: "PAID",
    razorpayOrderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
  });

  await newOrder.save();
  await cart.deleteOne();

  res.json({ success: true, message: "Payment verified & order placed" });
});

router.get("/", authmiddleware, async (req, res) => {
  const OrderHistory = await Order.find({ user: req.user._id })
    .sort({ creatAt: -1 })
    .select("-user -shippingAddress -paymentId -razorpayorderId");
  res.json({ message: "Order History", OrderHistory });
});

router.patch(
  "/status/:orderId",
  authmiddleware,
  checkRole("admin"),
  async (req, res) => {
    const { statuscode } = req.body;
    const updatedstatus = await Order.findByIdAndUpdate(
      req.params.orderId,
      { orderStatus: statuscode },
      { new: true }
    );
    if (!updatedstatus) {
      return res.status(404).json({ message: "Order not found!" });
    }
    res.json({ message: "update succfully!!", updatedstatus });
  }
);

module.exports = router;
