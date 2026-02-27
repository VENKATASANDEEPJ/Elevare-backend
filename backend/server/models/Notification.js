const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["reminder", "streak", "milestone"],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
