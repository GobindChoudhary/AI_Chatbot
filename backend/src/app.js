const express = require("express");
const authRoute = require("./router/auth.route");
const chatRoute = require("./router/chat.route");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

// CORS configuration - supports multiple origins
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",")
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoute);
app.use("/api/chat", chatRoute);
module.exports = app;
