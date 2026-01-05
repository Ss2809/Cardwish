const { required } = require("joi");
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
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
    totalPrice: { type: Number, default: 0 },
    shippingAddress : {type:String,required : true},
    paymentId : {type: String, required : true},
    razorpayorderId : String,
    paymentStatus : {type:String,required : true},
    orderStatus : {type:String,enum : ["pending","processing","shipped","delivered","cancelled"], default : "pending"},
    creatAt :{type:Date, default : Date.now()},
    deliveredAt : {type:Date}

})

const Order = mongoose.model("Order",orderSchema);
module.exports = Order;