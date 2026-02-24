require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authMiddleware = require("./middleware/authMiddleware");

const Goal = require("./models/Goal");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

/* ---------------- BASIC ROUTES ---------------- */

app.get("/", (req, res) => {
  res.json({ message: "Elevare API Running" });
});

app.get("/check", (req, res) => {
  res.json({ status: "API working correctly" });
});

/* ---------------- REGISTER ---------------- */

app.post("/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Create user (password auto-hashed via model hook)
    const user = new User({ email, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// LOGIN
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

/* ---------------- CREATE ---------------- */

app.post("/goals", async (req, res, next) => {
  try {
    const { title, description, targetDate, progress, streak, isCompleted } = req.body;

    const goal = new Goal({
      title,
      description,
      targetDate,
      progress,
      streak,
      isCompleted,
    });

    const savedGoal = await goal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    next(error);
  }
});

/* ---------------- READ ---------------- */

app.get("/goals", authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find();
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

/* ---------------- UPDATE ---------------- */

app.put("/goals/:id", async (req, res) => {
  try {
    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedGoal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ error: "Failed to update goal" });
  }
});

/* ---------------- DELETE ---------------- */

app.delete("/goals/:id", async (req, res) => {
  try {
    const deletedGoal = await Goal.findByIdAndDelete(req.params.id);

    if (!deletedGoal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete goal" });
  }
});

/* ---------------- ERROR HANDLER ---------------- */

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      details: err.message,
    });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({ error: "Internal server error" });
});

/* ---------------- SERVER START ---------------- */

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables.");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully.");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});

startServer();
