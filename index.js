//Global Configs
require("dotenv").config();
require("./config/passport");

//Third-party Modules
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

//Routes Modules
const userSchema = require("./routes/user");
const authrouter = require("./routes/auth");
const catgories = require("./routes/catgories");
const product = require("./routes/product");
const card = require("./routes/card");
const order = require("./routes/order");

//Initialize Express App
const app = express();

//Database Connection
mongoose
  .connect("mongodb://localhost:27017/Cardwish-bakend")
  .then(() => console.log("Mongodb conneted!!"))
  .catch((err) => console.log(err.message));

//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Serve Static Files
app.use("/images/catgories", express.static("upload/Catgories"));

//API Routes
app.use("/api/user", userSchema);
app.use("/api/auth", authrouter);
app.use("/api", catgories);
app.use("/api/product", product);
app.use("/api/card", card);
app.use("/api/order", order);

//Custom Error Handler
app.use((error, req, res, next) => {
  console.log("Error middleware running !!");
  return res.json({ message: "Internal Server Error!" });
});
//Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}....`));
