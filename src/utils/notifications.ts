export type NotificationType = "success" | "error" | "info" | "warning";

export interface AppNotification {
  id?: string;
  _id?: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const STORAGE_KEY = "webshield.notifications";
const EVENT_NAME = "webshield-notifications-updated";
const MAX_NOTIFICATIONS = 50;

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeNotification(value: any): AppNotification | null {
  if (!value || typeof value !== "object") return null;
  const id = value.id || value._id || createId();
  const type = (value.type || "info") as NotificationType;
  const title = String(value.title || "Notification");
  const message = String(value.message || "");
  const createdAt = value.createdAt || new Date().toISOString();
  const read = Boolean(value.read);
  return { id, type, title, message, createdAt, read };
}

/**
 * Load notifications from localStorage
 */
export function loadNotifications(): AppNotification[] {
  if (!canUseStorage()) return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed)
      ? parsed.map(normalizeNotification).filter(Boolean) as AppNotification[]
      : [];
  } catch (e) {
    console.warn("[notifications] Failed to parse localStorage:", e);
    return [];
  }
}

/**
 * Save notifications to localStorage (for local fallback)
 */
function saveNotifications(notifications: AppNotification[]) {
  if (!canUseStorage()) return;
  try {
    const toSave = notifications.slice(0, MAX_NOTIFICATIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(EVENT_NAME));
    }
  } catch (e) {
    console.warn("[notifications] Failed to save to localStorage:", e);
  }
}

/**
 * Add a notification locally (for real-time updates before server sync)
 */
export function addNotification(notification: Partial<AppNotification>) {
  const normalized = normalizeNotification({
    ...notification,
    createdAt: notification.createdAt || new Date().toISOString(),
  });
  if (!normalized) return;

  const existing = loadNotifications();
  const updated = [normalized, ...existing].slice(0, MAX_NOTIFICATIONS);
  saveNotifications(updated);
}

/**
 * Mark all notifications as read locally
 */
export function markAllNotificationsReadLocal() {
  const notifications = loadNotifications();
  const updated = notifications.map((n) => ({ ...n, read: true }));
  saveNotifications(updated);
}

/**
 * Remove a notification locally
 */
export function removeNotificationLocal(notificationId: string) {
  const notifications = loadNotifications();
  const updated = notifications.filter((n) => n.id !== notificationId && n._id !== notificationId);
  saveNotifications(updated);
}

/**
 * Get unread notification count
 */
export function getUnreadCount(): number {
  const notifications = loadNotifications();
  return notifications.filter((n) => !n.read).length;
}
