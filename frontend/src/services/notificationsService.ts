const API_URL = "http://localhost:5000/api/notifications";

const notificationsService = {
  async getAllNotifications(token: string) {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch notifications");
    return response.json();
  },

  async getUnreadCount(token: string) {
    const response = await fetch(`${API_URL}/unread/count`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch unread count");
    return response.json();
  },

  async markAsRead(token: string, notificationId: string) {
    const response = await fetch(`${API_URL}/${notificationId}/read`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to mark notification as read");
    return response.json();
  },

  async markAllAsRead(token: string) {
    const response = await fetch(`${API_URL}/read/all`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to mark all as read");
    return response.json();
  },

  async deleteNotification(token: string, notificationId: string) {
    const response = await fetch(`${API_URL}/${notificationId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error("Failed to delete notification");
    return response.json();
  },
};

export default notificationsService;
