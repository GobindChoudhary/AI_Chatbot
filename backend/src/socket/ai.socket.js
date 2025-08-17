const express = require("express");
const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { generateResponse } = require("../services/ai.service");
const messageModel = require("../models/message.model");

function connectSocket(httpServer) {
  const io = new Server(httpServer);

  // socket middleware
  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

    if (!cookies.token) {
      next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

      const user = await userModel.findById(decoded.id);

      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token provided"));
    }
  });

  io.on("connection", async (socket) => {
    socket.on("ai-message", async (messagePayload) => {
      // add message to DB
      await messageModel.create({
        user: socket.user._id,
        chat: messagePayload.chat,
        content: messagePayload.content,
        role: "user",
      });

      //  creating an arr of last 20 chats
      const chatHistory = (
        await messageModel
          .find({
            chat: messagePayload.chat,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
      ).reverse();

      // sending chatHistory to gemini
      const response = await generateResponse(
        chatHistory.map((item) => {
          return {
            role: item.role,
            parts: [{ text: item.content }],
          };
        })
      );

      // add message to DB
      await messageModel.create({
        user: socket.user._id,
        chat: messagePayload.chat,
        content: response,
        role: "model",
      });

      // sending response to client
      socket.emit("ai-response", {
        response: response,
        chat: messagePayload.chat,
      });
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected");
    });
  });
}

module.exports = connectSocket;
