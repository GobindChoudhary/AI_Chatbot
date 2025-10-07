const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");
const fetchFromWeb = require("../services/webapi.service");

function connectSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

      if (!cookies.token) {
        console.warn("Socket authentication failed: no token cookie present");
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);

      if (!user) {
        console.warn("Socket authentication failed: user not found");
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.warn("Socket authentication failed:", error.message);
      next(new Error("Authentication error: Invalid token provided"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.user.userName} connected`);

    socket.on("ai-message", async (messagePayload) => {
      try {
        // Validate message payload
        if (!messagePayload?.content || !messagePayload?.chat) {
          return socket.emit("error", { message: "Invalid message payload" });
        }

        // Save user message and generate vector in parallel
        const [message, vector] = await Promise.all([
          messageModel.create({
            user: socket.user._id,
            chat: messagePayload.chat,
            content: messagePayload.content,
            role: "user",
          }),
          generateVector(messagePayload.content),
        ]);

        // Check if message requires real-time information
        const isCurrentEvent = (text) => {
          const keywords = [
            "today",
            "latest",
            "current",
            "update",
            "news",
            "now",
            "time",
            "live",
            "price",
            "weather",
            "trending",
            "date",
            "when",
            "what day",
            "what time",
            "clock",
            "calendar",
            "this week",
            "this month",
            "this year",
            "right now",
            "at the moment",
            "currently",
            "real-time",
            "live data",
            "recent",
            "fresh",
            "up-to-date",
          ];
          return keywords.some((word) => text.toLowerCase().includes(word));
        };

        // Fetch external context if needed
        let externalContext = "";
        if (isCurrentEvent(messagePayload.content)) {
          try {
            externalContext = await fetchFromWeb(messagePayload.content);
          } catch (error) {
            console.warn("Failed to fetch external context:", error.message);
            externalContext =
              "Note: Unable to fetch real-time data at this moment. Please inform the user and provide the best available information based on your knowledge and the current date/time in your system context.";
          }
        }

        // Query vector database and fetch chat history in parallel
        const [memory, rawChatHistory] = await Promise.all([
          queryMemory({
            queryVector: vector,
            limit: 5,
            metadata: { user: socket.user._id },
          }),
          messageModel
            .find({ chat: messagePayload.chat })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean(),
        ]);

        // Store current message in vector database
        await createMemory({
          vector,
          messageId: message._id,
          metadata: {
            chat: messagePayload.chat,
            user: socket.user._id,
            text: messagePayload.content,
          },
        });

        // Prepare conversation context
        const chatHistory = rawChatHistory.reverse();
        const stm = chatHistory.map((item) => ({
          role: item.role,
          parts: [{ text: item.content }],
        }));

        const ltm = [
          {
            role: "user",
            parts: [
              {
                text: `Previous messages for context:\n${memory
                  .map((item) => item.metadata.text)
                  .join("\n")}`,
              },
            ],
          },
        ];

        const externalMessage = externalContext
          ? [
              {
                role: "user",
                parts: [
                  {
                    text: `REAL-TIME DATA (Use this for current information - this is authoritative and up-to-date):\n${externalContext}`,
                  },
                ],
              },
            ]
          : [];

        // Generate AI response with prioritized real-time data
        const response = await generateResponse([
          ...externalMessage, // Real-time data first for highest priority
          ...stm, // Short-term memory (recent chat)
          ...ltm, // Long-term memory (context from vector DB)
        ]);

        // Send response to client
        socket.emit("ai-response", {
          content: response,
          chat: messagePayload.chat,
        });

        // Save AI response and create vector memory
        const [responseMessage, responseVector] = await Promise.all([
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
          messageId: responseMessage._id,
          metadata: {
            chat: messagePayload.chat,
            user: socket.user._id,
            text: response,
          },
        });
      } catch (error) {
        console.error("AI message processing error:", error);
        socket.emit("error", { message: "Failed to process message" });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`User ${socket.user.userName} disconnected:`, reason);
    });
  });

  return io;
}

module.exports = connectSocket;
