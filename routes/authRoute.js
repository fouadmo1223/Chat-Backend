const express = require("express");
const router = express.Router();
const {
  registerController,
  loginController,
} = require("../controllers/authController");
const uploadSingle = require("../middlewares/multer"); // ✅ import multer middleware

// Register user (with image upload)
router.post("/register", uploadSingle("image"), registerController);

// Login user
router.post("/login", loginController);

module.exports = router;
