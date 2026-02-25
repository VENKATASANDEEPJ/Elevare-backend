const User = require("../models/User");

const getMe = async (req, res) => {
  try {
    const userId = req.user.userId || req.user;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

module.exports = {
  getMe,
};
