const express = require("express");
const authRoute = require("./router/auth.route");
const chatRoute = require("./router/chat.route");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

// CORS configuration - supports multiple origins
// const allowedOrigins = process.env.CLIENT_URL;
// ? process.env.CLIENT_URL.split(",")
// : ["http://localhost:5173"];

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/chat", chatRoute);
module.exports = app;
