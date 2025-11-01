const express = require("express");
const router = express.Router();
const {
  updateAvatarController,
  allUsers,
  updateNameController,
} = require("../controllers/userController");
const uploadSingle = require("../middlewares/multer");
const { protect } = require("../middlewares/authMiddleware"); // optional if you want auth

// PUT /api/users/avatar
router.put("/avatar", protect, uploadSingle("avatar"), updateAvatarController);
router.put("/name", protect, updateNameController);
router.route("/").get(protect, allUsers);

module.exports = router;
