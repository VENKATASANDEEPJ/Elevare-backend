const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendError, sendSuccess } = require("../utils/response");

const isEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!isEmail(email)) {
      return sendError(res, 400, "A valid email is required");
    }

    if (typeof password !== "string" || password.length < 6) {
      return sendError(res, 400, "Password must be at least 6 characters");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return sendError(res, 409, "User already exists");
    }

    const user = await User.create({
      email: normalizedEmail,
      password,
    });

    if (!process.env.JWT_SECRET) {
      return sendError(res, 500, "Server auth configuration is invalid");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return sendSuccess(res, 201, "Registration successful", { token });
  } catch {
    return sendError(res, 500, "Registration failed");
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!isEmail(email) || typeof password !== "string") {
      return sendError(res, 400, "Email and password are required");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return sendError(res, 401, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return sendError(res, 401, "Invalid credentials");
    }

    if (!process.env.JWT_SECRET) {
      return sendError(res, 500, "Server auth configuration is invalid");
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return sendSuccess(res, 200, "Login successful", { token });
  } catch {
    return sendError(res, 500, "Login failed");
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    return sendSuccess(res, 200, "Profile fetched", user);
  } catch {
    return sendError(res, 500, "Failed to fetch user profile");
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
