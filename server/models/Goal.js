const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
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
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Goal", goalSchema);
