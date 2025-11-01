const express = require("express");
const { chats } = require("./data/data");
const app = express();
require("dotenv").config();
const cors = require("cors"); // ✅ Fixed typo: was "reqire"
const connectDB = require("./config/db");
const Message = require("./models/message");

const authRoutes = require("./routes/authRoute");
const userRoutes = require("./routes/userRoute");
const chatRoutes = require("./routes/chatRoute");
const messageRoutes = require("./routes/messagesRoute");
const Notification = require("./models/notification");
const notificationRoutes = require("./routes/notifactionRoute");
const { notFound, errorHandler } = require("./middlewares/errorMiddelware");
const User = require("./models/user");
// Middleware
app.use(cors()); // ✅ Enable CORS so your frontend can call the API
app.use(express.json()); // ✅ Parse JSON requests
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/notifications", notificationRoutes);

const port = process.env.PORT || 5000;

// Root route
app.get("/", (req, res) => {
  res.send("Hello To Chat Server World!");
});

// Get all chats
app.get("/api/chats", (req, res) => {
  res.json(chats);
});

// Get chat by ID
app.get("/api/chats/:id", (req, res) => {
  const { id } = req.params;
  const chat = chats.find((chat) => chat._id === id);

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  res.json(chat);
});

app.use(notFound);
app.use(errorHandler);

// Start server
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  // Setup user
  socket.on("setup", (userData) => {
    socket.join(userData.id);
    socket.emit("connected");
  });

  // Join chat room
  socket.on("join chat", (room) => {
    socket.join(room);
  });

  // Typing indicators
  socket.on("typing", ({ room, user }) => {
    socket.in(room).emit("typing", user);
  });
  socket.on("stop typing", ({ room, user }) => {
    socket.in(room).emit("stop typing", user);
  });

  // Message sent
  socket.on("new message", async (newMessage) => {
    const chat = newMessage.chat;
    if (!chat?.users) return console.log("chat.users not defined");

    // 1️⃣ Emit message to all other users in chat
    chat.users.forEach((u) => {
      if (u._id.toString() === newMessage.sender._id.toString()) return;
      socket.in(u._id.toString()).emit("message recieved", newMessage);
    });

    // 2️⃣ Create a notification for each user (except sender)
    for (const u of chat.users) {
      if (u._id.toString() === newMessage.sender._id.toString()) continue;

      await Notification.create({
        user: u._id, // ✅ use u._id not u
        sender: newMessage.sender._id, // ✅ use from message sender
        chat: chat._id, // ✅ use from chat object
        message: newMessage._id,
        content:
          newMessage.content.length > 50
            ? newMessage.content.substring(0, 50) + "..."
            : newMessage.content,
      });

      // 3️⃣ Emit the real-time notification event
      socket.in(u._id.toString()).emit("new notification", {
        chat,
        sender: newMessage.sender,
        content: newMessage.content,
      });
    }
  });

  // Read receipt
  socket.on("message read", async ({ chatId, userId }) => {
    try {
      const messages = await Message.find({
        chat: chatId,
        readBy: { $ne: userId },
      });
      for (let msg of messages) {
        msg.readBy.push(userId);
        await msg.save();
      }
      const user = await User.findById(userId).select("name avatar email");
      socket.in(chatId).emit("message read", {
        chatId,
        user,
        messageIds: messages.map((m) => m._id),
      });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
