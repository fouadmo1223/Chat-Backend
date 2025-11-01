const {
  accessChat,
  fetchChats,
  createGroupChat,
  addUserToGroup,
  removeUserFromGroup,
  reNameGroup,
  leaveGroup,
} = require("../controllers/chatController");
const { protect } = require("../middlewares/authMiddleware");

const router = require("express").Router();

router.route("/").get(protect, fetchChats).post(protect, accessChat);
router.route("/group").post(protect, createGroupChat);
router.route("/group/rename").put(protect, reNameGroup);
router.route("/group/add").put(protect, addUserToGroup);
router.route("/group/remove").put(protect, removeUserFromGroup);
router.route("/group/leave").put(protect, leaveGroup);

module.exports = router;
