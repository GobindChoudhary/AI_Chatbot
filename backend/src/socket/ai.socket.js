const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

function connectSocket(httpServer) {
  const io = new Server(httpServer, {});

  // socket middleware
  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

    if (!cookies.token) {
      return next(new Error("Authentication error: No token provided"));
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

  io.on("connection", (socket) => {
    socket.on("ai-message", async (messagePayload) => {
      // add message to DB
      const message = await messageModel.create({
        user: socket.user._id,
        chat: messagePayload.chat,
        content: messagePayload.content,
        role: "user",
      });

      // creating vector
      const vector = await generateVector(messagePayload.content);

      // quering vector database
      const memory = await queryMemory({
        queryVector: vector,
        limit: 5,
        metadata: {
          user: socket.user._id,
        },
      });

      // creating memory in vector database
      await createMemory({
        vector,
        messageId: message._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: messagePayload.content,
        },
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

      // stm

      const stm = chatHistory.map((item) => {
        return {
          role: item.role,
          parts: [{ text: item.content }],
        };
      });

      const ltm = [
        {
          role: "user",
          parts: [
            {
              text: ` these are some previous messages from the chat, use them to generate a response \n ${memory
                .map((item) => item.metadata.text)
                .join("\n")}`,
            },
          ],
        },
      ];

      // sending chatHistory to gemini
      console.log("memory");
      console.log(memory);
      console.log("LTM");
      console.log(ltm[0]);
      console.log("STM");
      console.log(stm);
      const response = await generateResponse([...ltm, ...stm]);

      // add message to DB
      const responseMemory = await messageModel.create({
        user: socket.user._id,
        chat: messagePayload.chat,
        content: response,
        role: "model",
      });

      const responseVector = await generateVector(response);

      await createMemory({
        vector: responseVector,
        messageId: responseMemory._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: response,
        },
      });

      // sending response to client
      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat,
      });
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected");
    });
  });
}

module.exports = connectSocket;
