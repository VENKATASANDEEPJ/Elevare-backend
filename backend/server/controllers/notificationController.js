const Notification = require("../models/Notification");

// GET NOTIFICATIONS FOR USER
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.find({ user: userId })
      .populate("goal", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// GET UNREAD NOTIFICATION COUNT
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await Notification.countDocuments({
      user: userId,
      isRead: false,
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
};

// MARK NOTIFICATION AS READ
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.user.toString() !== req.user.userId.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

// MARK ALL NOTIFICATIONS AS READ
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark all as read" });
  }
};

// DELETE NOTIFICATION
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (notification.user.toString() !== req.user.userId.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await notification.deleteOne();

    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete notification" });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
