const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/* --------- HASH PASSWORD BEFORE SAVE --------- */

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const bcrypt = require("bcryptjs");
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* --------- PASSWORD COMPARISON METHOD --------- */

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
