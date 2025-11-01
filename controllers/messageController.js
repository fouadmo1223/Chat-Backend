const Message = require("../models/message");
const Chat = require("../models/chat");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");

// Controller to send a new message
const sendMessageController = asyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.status(400).json({ message: "Content and ChatId are required" });
  }

  const newMessage = {
    sender: req.user._id,
    content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name avatar");
    message = await message.populate("readBy", "name avatar");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name avatar email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    const messageWithEditFlag = {
      ...message.toObject(),
      canEdit: true,
    };

    res
      .status(201)
      .json({ message: messageWithEditFlag, msg: "Message Sent Successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to send message" });
  }
});

// ✅ Update message controller
const updateMessageController = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  const message = await Message.findById(messageId);

  if (!message) {
    return res.status(404).json({ message: "Message not found" });
  }

  // Check ownership
  if (req.user._id.toString() !== message.sender.toString()) {
    return res
      .status(403)
      .json({ message: "Forbidden: You can only edit your own messages" });
  }

  // Check 15-minute edit window
  const fifteenMinutes = 15 * 60 * 1000;
  const timeSinceCreated = Date.now() - new Date(message.createdAt).getTime();

  if (timeSinceCreated > fifteenMinutes) {
    return res
      .status(403)
      .json({ message: "You cannot edit this message after 15 minutes" });
  }

  // Update content
  try {
    message.content = content;
    await message.save();
    res.status(200).json({ message, msg: "Message Updated Successfully" });
  } catch (error) {
    res.status(400).json({ message: "Failed to update message" });
  }
});

// ✅ Get all messages in a chat
const allMessagesController = asyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name avatar email")
      .populate("readBy", "name avatar email")
      .populate("chat");

    const enhancedMessages = messages.map((msg) => {
      const fifteenMinutes = 15 * 60 * 1000;
      const timeSinceCreated = Date.now() - new Date(msg.createdAt).getTime();

      const canEdit =
        msg.sender._id.toString() === req.user._id.toString() &&
        timeSinceCreated <= fifteenMinutes;

      return {
        ...msg.toObject(),
        content: msg.isDeleted ? "message deleted" : msg.content,
        canEdit,
      };
    });

    res.status(200).json({
      messages: enhancedMessages,
      message: "Messages Fetched Successfully",
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to fetch messages" });
  }
});

// ✅ Delete message controller (toggle)
const deleteMessageController = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId;

  if (!messageId) {
    return res.status(400).json({ message: "MessageId is required" });
  }

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const message = await Message.findById(messageId);

  if (!message) {
    return res.status(404).json({ message: "Message not found" });
  }

  if (req.user._id.toString() !== message.sender.toString()) {
    return res
      .status(403)
      .json({ message: "Forbidden: You can only delete your own messages" });
  }

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { isDeleted: !message.isDeleted },
      { new: true }
    );

    const msg = updatedMessage.isDeleted
      ? "Message Deleted Successfully"
      : "Message Restored Successfully";

    res.status(200).json({ message: msg });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete message" });
  }
});

module.exports = {
  sendMessageController,
  updateMessageController,
  allMessagesController,
  deleteMessageController,
};
