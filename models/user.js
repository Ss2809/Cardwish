const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, minlength: 3, required: true },
  email: { type: String, lowercase: true, uniqe: true, required: true },
  password: { type: String, required: false },
  gogleId : {type :String, uniqe : true},
  deliveryAddress: { type: String, required: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  refreshtoken : {type :String}
});

const User = mongoose.model("User", userSchema);

module.exports = User;
