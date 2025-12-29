const { required } = require("joi");
const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
  title : {type : String, required : true, maxlength : 50},
  description : {type :String, required : true, minlength : 50},
  seller : {type : mongoose.Schema.Types.ObjectId,ref : "User", required : true},
  category : {type :mongoose.Schema.Types.ObjectId, ref : "Catgories", required : true},
  price : {type :Number,requied : true,min : 0},
  stock : {type : Number, required : true, min : 0},
  images : { type : [String], required : true},
  review : [
    {
      user : {type : mongoose.Schema.Types.ObjectId, ref : "User", required : true},
      rating : {type : Number,requied : true, min : 0},
      comment : {type :String}
    }
  ]
})

const Product = mongoose.model("Product", productSchema);

module.exports = Product;