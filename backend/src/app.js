const express = require("express");
const authRoute = require("./router/auth.route");
const cookieParser = require("cookie-parser");
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoute);

module.exports = app;
