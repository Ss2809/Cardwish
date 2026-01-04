
const mongoose = require("mongoose");

cardShema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: { type: Number, required: true, min: 1, default: 1 },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      image: { type: String, required: true },
     
    },
  ],
  totalProduct: { type: Number, default: 0 },
  totalCardPrice: { type: Number, default: 0 },
});

const Card = mongoose.model("Card", cardShema);
module.exports = Card;
