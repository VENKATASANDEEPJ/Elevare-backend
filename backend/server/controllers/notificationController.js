const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const { sendError, sendSuccess } = require("../utils/response");

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getNotifications = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const notifications = await Notification.find({ user: userId })
      .populate("goal", "title")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Notifications fetched", notifications);
  } catch {
    return sendError(res, 500, "Failed to fetch notifications");
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const count = await Notification.countDocuments({ user: userId, isRead: false });

    return sendSuccess(res, 200, "Unread count fetched", { unreadCount: count });
  } catch {
    return sendError(res, 500, "Failed to fetch unread count");
  }
};

const markAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const notificationId = req.params.id;

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!isValidObjectId(notificationId)) {
      return sendError(res, 400, "Invalid notification id");
    }

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return sendError(res, 404, "Notification not found");
    }

    if (notification.user.toString() !== userId.toString()) {
      return sendError(res, 403, "Not authorized");
    }

    notification.isRead = true;
    await notification.save();

    return sendSuccess(res, 200, "Notification marked as read", notification);
  } catch {
    return sendError(res, 500, "Failed to mark notification as read");
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });

    return sendSuccess(res, 200, "All notifications marked as read");
  } catch {
    return sendError(res, 500, "Failed to mark all notifications as read");
  }
};

const deleteNotification = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const notificationId = req.params.id;

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!isValidObjectId(notificationId)) {
      return sendError(res, 400, "Invalid notification id");
    }

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return sendError(res, 404, "Notification not found");
    }

    if (notification.user.toString() !== userId.toString()) {
      return sendError(res, 403, "Not authorized");
    }

    await notification.deleteOne();

    return sendSuccess(res, 200, "Notification deleted");
  } catch {
    return sendError(res, 500, "Failed to delete notification");
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
