require("dotenv").config();
require("./config/passport");
const express = require("express");
const mongoose = require("mongoose");
const userSchema = require("./routes/user");
const authrouter = require("./routes/auth");
const app = express();

mongoose
  .connect("mongodb://localhost:27017/Cardwish-bakend")
  .then(() => console.log("Mongodb conneted!!"))
  .catch((err) => console.log(err.message));

app.use(express.json());
app.use("/api/user", userSchema);
app.use("/api/auth", authrouter);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}....`));
