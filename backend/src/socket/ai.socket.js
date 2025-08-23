const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");
const fetchFromWeb = require("../services/webapi.service");
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
      // adding message to DB and generating vector
      const [message, vector] = await Promise.all([
        // add message to DB
        messageModel.create({
          user: socket.user._id,
          chat: messagePayload.chat,
          content: messagePayload.content,
          role: "user",
        }),
        // creating vector
        generateVector(messagePayload.content),
      ]);

      const isCurrentEvent = (text) => {
        const keywords = [
          "today",
          "latest",
          "news",
          "current",
          "price",
          "weather",
          "update",
        ];
        return keywords.some((word) => text.toLowerCase().includes(word));
      };

      let externalContext = "";
      if (isCurrentEvent(messagePayload.content)) {
        externalContext = await fetchFromWeb(messagePayload.content);
      }

      const externalMessage = {
        role: "user",
        parts: [
          {
            text: `Here is some up-to-date information use this to generate a better response for user in the context of previous conversation:\n\n${externalContext}`,
          },
        ],
      };

      // quering vector database  & fetching old 20 chat
      const [memory, rawChatHistory] = await Promise.all([
        queryMemory({
          queryVector: vector,
          limit: 5,
          metadata: {
            user: socket.user._id,
          },
        }),
        messageModel
          .find({
            chat: messagePayload.chat,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean(),
      ]);

      //  creating memory in vector database
      await createMemory({
        vector,
        messageId: message._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: messagePayload.content,
        },
      });

      //  reverseing an arr of last 20 chats so latest chat come first
      const chatHistory = rawChatHistory.reverse();

      // stm
      const stm = chatHistory.map((item) => {
        return {
          role: item.role,
          parts: [{ text: item.content }],
        };
      });

      // ltm
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
      const response = await generateResponse([
        externalMessage,
        ...ltm,
        ...stm,
      ]);

      // sending response to client
      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat,
      });

      // add responsemessage to DB and generating vector of response of ai
      const [responseMemory, responseVector] = await Promise.all([
        messageModel.create({
          user: socket.user._id,
          chat: messagePayload.chat,
          content: response,
          role: "model",
        }),
        generateVector(response),
      ]);

      await createMemory({
        vector: responseVector,
        messageId: responseMemory._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: response,
        },
      });
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected");
    });
  });
}

module.exports = connectSocket;
