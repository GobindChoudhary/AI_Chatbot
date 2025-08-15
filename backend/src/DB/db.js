const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL).then(() => {
      console.log("database connected 👍");
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = connectDB;
