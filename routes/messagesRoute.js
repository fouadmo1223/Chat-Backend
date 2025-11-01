const router = require("express").Router();

const {
  sendMessageController,
  allMessagesController,
  deleteMessageController,
  updateMessageController,
} = require("../controllers/messageController");
const { protect } = require("../middlewares/authMiddleware");

router.route("/").post(protect, sendMessageController);
router.route("/:chatId").get(protect, allMessagesController);
router
  .route("/:messageId")
  .delete(protect, deleteMessageController)
  .put(protect, updateMessageController);

module.exports = router;
