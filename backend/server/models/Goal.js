const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["Coding", "Fitness", "Language", "Reading", "Health", "Productivity", "Other"],
      required: true,
    },
    targetDays: {
      type: Number,
      default: 30,
    },
    startDate: {
      type: Date,
      required: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    completionHistory: [
      {
        date: Date,
        completed: Boolean,
      },
    ],
    reminderTime: {
      type: String,
      default: "09:00",
    },
    active: {
      type: Boolean,
      default: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Goal", goalSchema);
