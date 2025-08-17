const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      require: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chat",
      require: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "model"],
      default: "user",
    },
  },

  {
    timestamps: true,
  }
);

const messageModel = mongoose.model("message", messageSchema);

module.exports = messageModel;
