const mongoose = require("mongoose");

const catgoriesSchema  = new mongoose.Schema({
  name :{type : String, required :true},
  image : {type : String, required : true}

})

const Catgories = mongoose.model("Catgories", catgoriesSchema);

module.exports = Catgories;