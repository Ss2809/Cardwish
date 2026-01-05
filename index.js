require("dotenv").config();
require("./config/passport");

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const userSchema = require("./routes/user");
const authrouter = require("./routes/auth");
const catgories = require("./routes/catgories");
const product = require("./routes/product");
const card = require("./routes/card");
const order = require("./routes/order");

mongoose
  .connect("mongodb://localhost:27017/Cardwish-bakend")
  .then(() => console.log("Mongodb conneted!!"))
  .catch((err) => console.log(err.message));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/images/catgories", express.static("upload/Catgories"));

app.use("/api/user", userSchema);
app.use("/api/auth", authrouter);
app.use("/api", catgories);
app.use("/api/product", product);
app.use("/api/card", card);
app.use("/api/order", order);

// app.use((error,req,res,next)=>{
//   console.log("Error middleware running !!");
//   return res.json({message:"Internal Server Error!"})
// })

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}....`));
