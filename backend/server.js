require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/DB/db");


const connectSocket = require("./src/socket/ai.socket");
const { createServer } = require("http");

const httpServer = createServer(app);
connectSocket(httpServer);


connectDB();
httpServer.listen(3000, () => {
  console.log("Server is running on port 3000");
});
