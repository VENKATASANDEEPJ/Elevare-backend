require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authMiddleware = require("./middleware/authMiddleware");
const userRoutes = require("./routes/userRoutes");

const Goal = require("./models/Goal");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);

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

app.post("/goals", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user;
    const { text, title, description, targetDate, progress, streak, completed } = req.body;

    const goal = await Goal.create({
      user: userId,
      text: text ?? title,
      title: title ?? text,
      description,
      targetDate,
      progress,
      streak,
      completed,
      completedAt: completed ? new Date() : null,
    });

    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
});

/* ---------------- READ ---------------- */

app.get("/goals", authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.userId || req.user });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

app.get("/goals/progress", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user;
    const total = await Goal.countDocuments({ user: userId });
    const completed = await Goal.countDocuments({
      user: userId,
      completed: true,
    });

    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    res.status(200).json({
      total,
      completed,
      percentage,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch goal progress" });
  }
});

/* ---------------- UPDATE ---------------- */

app.put("/goals/:id", authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (goal.user.toString() !== (req.user.userId || req.user).toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    if (req.body.completed === true && !goal.completed) {
      goal.completed = true;
      goal.completedAt = new Date();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const user = await User.findById(req.user.userId || req.user);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;

      if (lastActive) {
        lastActive.setHours(0, 0, 0, 0);
      }

      if (!lastActive) {
        user.streak = 1;
      } else {
        const diffTime = today - lastActive;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          user.streak += 1;
        } else if (diffDays > 1) {
          user.streak = 1;
        }
      }

      if (user.streak > user.longestStreak) {
        user.longestStreak = user.streak;
      }

      user.lastActiveDate = today;
      await user.save();
    }

    if (req.body.completed === false) {
      goal.completed = false;
      goal.completedAt = null;
    }

    goal.text = req.body.text ?? goal.text;

    await goal.save();

    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ error: "Failed to update goal" });
  }
});

/* ---------------- DELETE ---------------- */

app.delete("/goals/:id", authMiddleware, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (goal.user.toString() !== (req.user.userId || req.user).toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await goal.deleteOne();

    res.status(200).json({ message: "Goal removed" });
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
