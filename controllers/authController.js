const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { registerSchema, loginSchema } = require("../schemas/authSchemas");
const generateToken = require("../utils/generateToken");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../config/cloudinary");

// @desc Register User
const registerController = asyncHandler(async (req, res) => {
  const parseResult = registerSchema.safeParse(req.body);

  if (!parseResult.success) {
    const errorDetails = {};
    parseResult.error.issues.forEach((err) => {
      errorDetails[err.path[0]] = err.message;
    });
    return res.status(400).json({ errors: errorDetails });
  }

  const { name, email, password } = parseResult.data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email User already exists" });
  }

  // ✅ Upload avatar if file provided
  let avatarUrl, avatarPublicId;
  if (req.file) {
    console.log("inside upload");

    const uploadResult = await uploadToCloudinary(req.file.buffer);
    avatarUrl = uploadResult.secure_url;
    avatarPublicId = uploadResult.public_id;
  }

  const newUser = await User.create({
    name,
    email,
    password,
    avatar: avatarUrl,
    avatar_public_id: avatarPublicId,
  });

  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
    },
    token: generateToken(newUser._id, newUser.name, newUser.email),
  });
});

// @desc Login User
const loginController = asyncHandler(async (req, res) => {
  const parseResult = loginSchema.safeParse(req.body);

  if (!parseResult.success) {
    const errorMessages = parseResult.error.errors.map((e) => e.message);
    return res.status(400).json({ message: errorMessages[0] });
  }

  const { email, password } = parseResult.data;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.status(200).json({
    message: "Login successful",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id, user.name, user.email),
    },
  });
});

module.exports = { registerController, loginController };
