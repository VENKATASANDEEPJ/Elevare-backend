require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const goalRoutes = require("./routes/goalRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/notifications", notificationRoutes);

/* ---------------- BASIC ROUTES ---------------- */

app.get("/", (req, res) => {
  res.json({ message: "Elevare API Running" });
});

app.get("/check", (req, res) => {
  res.json({ status: "API working correctly" });
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
