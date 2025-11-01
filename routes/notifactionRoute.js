// routes/notificationRoutes.js
const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  getNotifications,
  markAsRead,
} = require("../controllers/notifactionController");
const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/read", protect, markAsRead);

module.exports = router;
