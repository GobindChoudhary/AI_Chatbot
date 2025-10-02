const express = require("express");
const {
  createChat,
  getMessages,
  getChats,
} = require("../controller/chat.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware, createChat);
router.get("/:chatId/messages", authMiddleware, getMessages);
router.get("/", authMiddleware, getChats);

module.exports = router;
