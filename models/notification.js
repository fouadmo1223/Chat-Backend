// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // who receives this
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // who sent it
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true }, // related chat
    message: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }, // optional, the actual message
    content: { type: String }, // store text preview
    isRead: { type: Boolean, default: false }, // has the user seen it
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
