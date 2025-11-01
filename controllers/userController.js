const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../config/cloudinary");

// @desc Update user's avatar
// @route PUT /api/user/avatar
// @access Private
const updateAvatarController = asyncHandler(async (req, res) => {
  const userId = req.user._id; // assuming protect middleware sets req.user
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No image file uploaded" });
  }

  // ✅ Delete old image if exists
  if (user.avatar_public_id) {
    await deleteFromCloudinary(user.avatar_public_id);
  }

  // ✅ Upload new image
  const uploadResult = await uploadToCloudinary(req.file.buffer);

  user.avatar = uploadResult.secure_url;
  user.avatar_public_id = uploadResult.public_id;
  await user.save();

  res.status(200).json({
    message: "Avatar updated successfully",
    avatar: user.avatar,
  });
});

// @route PUT /api/user/name
// @access Private
const updateNameController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.name = name;
  await user.save();

  res.status(200).json({
    message: "Name updated successfully",
    name: user.name,
  });
});

// @desc get user
// @route PUT /api/user?search=

const allUsers = asyncHandler(async (req, res) => {
  const query = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(query)
    .find({ _id: { $ne: req.user._id } })
    .select("-password");
  if (users.length === 0) {
    return res.status(200).json({ message: "No users found", users: [] });
  }
  res.status(200).json({
    message: "All users fetched successfully",
    users,
  });
});

module.exports = { updateAvatarController, allUsers, updateNameController };
