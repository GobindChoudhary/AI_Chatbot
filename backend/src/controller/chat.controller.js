const chatModel = require("../models/chat.model");

async function createChat(req, res) {
  const { title } = req.body;
  const user = req.user;

  const chat = await chatModel.create({
    user: user._id,
    title: title,
  });

  res.status(201).json({
    message: "chat created Successfully ",
    chat: {
      _id: chat._id,
      title: chat.title,
      user: chat.user,
      lastActivity: chat.lastActivity,
    },
  });
}

module.exports = {
  createChat,
};
