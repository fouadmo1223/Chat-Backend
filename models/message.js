const mongoose = require("mongoose");

// Each message has text, sender, chat, and timestamps
const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // reference to User collection
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat", // reference to Chat collection
      required: true,
    },
    // optional: track if the message is read by users
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
