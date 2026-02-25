const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    text: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    streak: {
      type: Number,
      default: 0,
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
