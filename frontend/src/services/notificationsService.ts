import { apiRequest } from "./apiClient";

export interface NotificationItem {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const notificationsService = {
  getAllNotifications(token?: string) {
    return apiRequest<NotificationItem[]>("/notifications", {
      method: "GET",
      token,
    });
  },

  getUnreadCount(token?: string) {
    return apiRequest<{ unreadCount: number }>("/notifications/unread/count", {
      method: "GET",
      token,
    });
  },

  markAsRead(notificationId: string, token?: string) {
    return apiRequest<NotificationItem>(`/notifications/${notificationId}/read`, {
      method: "PATCH",
      token,
    });
  },

  markAllAsRead(token?: string) {
    return apiRequest<{ message: string }>("/notifications/read/all", {
      method: "PATCH",
      token,
    });
  },

  deleteNotification(notificationId: string, token?: string) {
    return apiRequest<{ message: string }>(`/notifications/${notificationId}`, {
      method: "DELETE",
      token,
    });
  },
};

export default notificationsService;
