const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", getNotifications);
router.get("/unread/count", getUnreadCount);
router.patch("/:id/read", markAsRead);
router.patch("/read/all", markAllAsRead);
router.delete("/:id", deleteNotification);

module.exports = router;
