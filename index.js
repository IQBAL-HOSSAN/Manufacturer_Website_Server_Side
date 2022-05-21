const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8000;
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Use Midleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("backed server connected");
});

app.listen(port, () => {
  console.log("Backend server is running!");
});
