import api from "./axios";

/**
 * Fetch all notifications for the current user
 */
export async function getNotifications() {
  return api.get("/notifications");
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead() {
  return api.post("/notifications/read-all");
}

/**
 * Delete a specific notification
 */
export async function deleteNotification(notificationId: string) {
  return api.delete(`/notifications/${notificationId}`);
}

/**
 * (Admin) Send an announcement to users
 */
export async function sendAnnouncement(
  title: string,
  message: string,
  type?: "info" | "success" | "warning" | "error",
  recipientUserIds?: string[]
) {
  return api.post("/notifications/announce", {
    title,
    message,
    type: type || "info",
    recipientUserIds: recipientUserIds || null,
  });
}
