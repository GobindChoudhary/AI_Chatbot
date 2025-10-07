const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");

async function createChat(req, res) {
  try {
    const { title } = req.body;
    const user = req.user;

    const chat = await chatModel.create({
      user: user._id,
      title: title,
    });

    res.status(201).json({
      message: "Chat created successfully",
      chat: {
        _id: chat._id,
        title: chat.title,
        user: chat.user,
        lastActivity: chat.lastActivity,
      },
    });
  } catch (error) {
    console.error("CreateChat Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getMessages(req, res) {
  try {
    const { chatId } = req.params;
    const user = req.user;

    const chat = await chatModel.findOne({ _id: chatId, user: user._id });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const messages = await messageModel
      .find({ chat: chatId })
      .sort({ createdAt: 1 });

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("GetMessages Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function getChats(req, res) {
  try {
    const user = req.user;
    const chats = await chatModel
      .find({ user: user._id })
      .sort({ lastActivity: -1 });

    return res.status(200).json({ chats });
  } catch (error) {
    console.error("GetChats Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

async function deleteChat(req, res) {
  try {
    const { chatId } = req.params;
    const user = req.user;

    const chat = await chatModel.findOne({ _id: chatId, user: user._id });
    if (!chat) {
      return res.status(404).json({
        message: "Chat not found or access denied",
      });
    }

    await messageModel.deleteMany({ chat: chatId });
    await chatModel.findByIdAndDelete(chatId);

    return res.status(200).json({
      message: "Chat deleted successfully",
      chatId: chatId,
    });
  } catch (error) {
    console.error("DeleteChat Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createChat,
  getMessages,
  getChats,
  deleteChat,
};
