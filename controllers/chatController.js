const Chat = require("../models/chat");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
// @desc    Access or create a one-on-one chat
// @route   POST /api/chat/
// @access  Private
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json({ message: "User id param not sent with request" });
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name avatar email",
  });

  if (isChat.length > 0) {
    res.status(200).json({ message: "Chat already exists", chat: isChat[0] });
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json({
        message: "Chat created successfully",
        chat: FullChat,
      });
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

// @desc    Fetch all chats for a user
// @route   GET /api/chat/
// @access  Private
const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name avatar email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the fields" });
  }

  var users = req.body.users;
  users = JSON.parse(users);

  if (users.length < 2) {
    return res
      .status(400)
      .json({ message: "More than 2 users are required to form a group chat" });
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json({
      message: "Group Chat Created Successfully",
      groupChat: fullGroupChat,
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const reNameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  if (!chatId || !chatName) {
    res.status(400).json({ message: "Please provide chatId and chatName" });
  }

  const chat = await Chat.findById(chatId).populate("groupAdmin", "-password");
  if (!chat) {
    return res.status(404).json({ message: "Chat Not Found" });
  }
  if (chat.groupAdmin._id.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(404).json({ message: "Chat Not Found" });
  } else {
    res.json({
      message: "Group Renamed Successfully",
      groupChat: updatedChat,
    });
  }
});

const addUserToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const chat = await Chat.findById(chatId).populate("groupAdmin", "-password");

  if (!chat) {
    return res.status(404).json({ message: "Chat Not Found" });
  }
  if (chat.groupAdmin._id.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404).json({ message: "Chat Not Found" });
  } else {
    res.json({
      message: "User Added to Group Successfully",
      groupChat: added,
    });
  }
});
const removeUserFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const chat = await Chat.findById(chatId).populate("groupAdmin", "-password");

  if (!chat) {
    return res.status(404).json({ message: "Chat Not Found" });
  }
  if (
    chat.groupAdmin._id.toString() !== req.user._id.toString() &&
    userId !== req.user._id.toString()
  ) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404).json({ message: "Chat Not Found" });
  } else {
    res.json({
      message: "User Removed from Group Successfully",
      groupChat: removed,
    });
  }
});

const leaveGroup = asyncHandler(async (req, res) => {
  const { chatId } = req.body;
  const chat = await Chat.findById(chatId);

  if (!chat) return res.status(404).json({ message: "Chat Not Found" });

  const userId = req.user._id.toString();

  // Remove the user from users array
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  // If the user was the last in the group, maybe delete chat or just return empty
  const isEmpty = updatedChat.users.length === 0;

  res.json({
    message: "You left the chat",
    groupChat: isEmpty ? null : updatedChat,
  });
});
module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  reNameGroup,
  addUserToGroup,
  removeUserFromGroup,
  leaveGroup,
};
