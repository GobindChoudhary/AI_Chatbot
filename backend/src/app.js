const express = require("express");
const authRoute = require("./router/auth.route");
const chatRoute = require("./router/chat.route");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoute);
app.use("/chat", chatRoute);
module.exports = app;
