# 💬 MERN Chat Backend

A powerful **Node.js + Express + MongoDB** backend for a real-time chat application.  
It includes **user authentication**, **chat management**, **real-time messaging**, **notifications**, and **read receipts**, all powered by **Socket.io** and **Mongoose**.

---

## 🚀 Features

- 🔐 **User Authentication** (Register / Login using JWT)  
- 💬 **Chat Management** (1-on-1 & group chats)  
- ✉️ **Real-time Messaging** using Socket.io  
- 👀 **Read Receipts** for messages  
- ✍️ **Typing Indicators** between users  
- 🔔 **Real-time Notifications** for new messages  
- ☁️ **Image Uploads** with Cloudinary and Multer  
- ⚙️ **Robust Error Handling** and async middleware  

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB with Mongoose |
| **Authentication** | JSON Web Token (JWT) |
| **Real-time** | Socket.io |
| **Uploads** | Multer + Cloudinary |
| **Validation** | Zod + Validator.js |
| **Env Management** | dotenv |

---

## 🗂️ Folder Structure

```
mern-chat/
├── config/
│   └── db.js
├── data/
│   └── data.js
├── middlewares/
│   └── errorMiddleware.js
├── models/
│   ├── user.js
│   ├── chat.js
│   ├── message.js
│   └── notification.js
├── routes/
│   ├── authRoute.js
│   ├── userRoute.js
│   ├── chatRoute.js
│   ├── messagesRoute.js
│   └── notifactionRoute.js
├── index.js
├── package.json
└── .env
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/mern-chat-backend.git
cd mern-chat-backend
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Environment Variables
Create a `.env` file in the root directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4️⃣ Run the Server
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

Server runs by default at:  
👉 **http://localhost:5000**

---

## 🔌 Socket.io Events

| Event | Payload | Description |
|--------|----------|-------------|
| `setup` | `{ userData }` | Joins a private room by user ID |
| `join chat` | `{ room }` | Joins a chat room by chat ID |
| `typing` | `{ room, user }` | Broadcast typing indicator |
| `stop typing` | `{ room, user }` | Broadcast stop typing |
| `new message` | `{ newMessage }` | Emits new message to other users & creates notifications |
| `message read` | `{ chatId, userId }` | Marks messages as read and notifies others |
| `new notification` | `{ chat, sender, content }` | Sends a real-time notification to recipients |

---

## 🧾 REST API Endpoints

| Method | Endpoint | Description |
|---------|-----------|-------------|
| **POST** | `/api/auth/register` | Register new user |
| **POST** | `/api/auth/login` | Login existing user |
| **GET** | `/api/user` | Fetch all users |
| **POST** | `/api/chat` | Create or fetch chat |
| **GET** | `/api/chat` | Get all user chats |
| **POST** | `/api/message` | Send a new message |
| **GET** | `/api/message/:chatId` | Get all messages for a chat |
| **GET** | `/api/notifications` | Fetch all user notifications |

---

## 🧩 Middleware

- **express.json()** → Parse incoming JSON requests  
- **cors()** → Enable CORS for frontend communication  
- **express-async-handler** → Simplify async error handling  
- **errorMiddleware.js** → Centralized error & 404 handlers  

---

## 🗃️ Models Overview

### 🧍‍♂️ User
```js
{
  name: String,
  email: String,
  password: String (hashed),
  avatar: String,
  isAdmin: Boolean
}
```

### 💬 Chat
```js
{
  chatName: String,
  isGroupChat: Boolean,
  users: [User],
  latestMessage: Message
}
```

### ✉️ Message
```js
{
  sender: User,
  content: String,
  chat: Chat,
  readBy: [User]
}
```

### 🔔 Notification
```js
{
  user: User,
  sender: User,
  chat: Chat,
  message: Message,
  content: String
}
```

---

## 🧰 Developer Tools

| Tool | Purpose |
|------|----------|
| **Nodemon** | Auto-reload on file changes |
| **Zod** | Schema validation |
| **Validator.js** | Input sanitization |
| **dotenv** | Environment variables |
| **Mongoose** | MongoDB ORM |

---

## 🧑‍💻 Author

**Fouad Mohamed Abdelkader**  
Software Engineer | MERN Stack Developer  
📧 fm0850020@gmail.com
🌐 [https://github.com/fouadmo1223](https://github.com/fouadmo1223)

---

## 🪪 License

This project is licensed under the **ISC License**.  
Feel free to use, modify, and share.
