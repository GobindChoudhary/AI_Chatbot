const express = require("express");
const { createChat } = require("../controller/chat.controller");
const { authMiddleware } = require("../middleware/auth.middleware");
    
const router = express.Router();

router.post("/", authMiddleware, createChat);

module.exports = router;
