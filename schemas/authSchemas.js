const { z } = require("zod");

// Register Schema
const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email format" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Confirm password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Login Schema
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid Email or Password" }),
  password: z.string().min(6, { message: "Invalid Email or Password" }),
});

module.exports = { registerSchema, loginSchema };
