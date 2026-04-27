export type NotificationType = "success" | "error" | "info" | "warning";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const STORAGE_KEY = "webshield.notifications";
const EVENT_NAME = "webshield-notifications-updated";
const MAX_NOTIFICATIONS = 20;

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: "welcome-notification",
    type: "info",
    title: "Welcome to Vuln Spectra",
    message: "Your notification center is ready for scan updates and admin actions.",
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: "scan-complete-notification",
    type: "success",
    title: "Scan #44A2 completed",
    message: "The latest scan finished successfully.",
    createdAt: new Date().toISOString(),
    read: true,
  },
];

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneDefaults() {
  return DEFAULT_NOTIFICATIONS.map((notification) => ({ ...notification }));
}

function normalizeNotification(value: any): AppNotification | null {
  if (!value || typeof value !== "object") return null;
  const type = value.type;
  if (!["success", "error", "info", "warning"].includes(type)) return null;
  return {
    id: String(value.id || createId()),
    type,
    title: String(value.title || "Notification"),
    message: String(value.message || ""),
    createdAt: String(value.createdAt || new Date().toISOString()),
    read: Boolean(value.read),
  };
}

function emitChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT_NAME));
}

function persistNotifications(notifications: AppNotification[]) {
  if (!canUseStorage()) return notifications;
  const next = notifications.slice(0, MAX_NOTIFICATIONS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  emitChange();
  return next;
}

export function loadNotifications(): AppNotification[] {
  if (!canUseStorage()) return cloneDefaults();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = cloneDefaults();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      const seeded = cloneDefaults();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }

    const normalized = parsed
      .map(normalizeNotification)
      .filter((notification): notification is AppNotification => Boolean(notification));

    if (normalized.length === 0) {
      const seeded = cloneDefaults();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }

    return normalized.slice(0, MAX_NOTIFICATIONS);
  } catch {
    const seeded = cloneDefaults();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    } catch {
      // Ignore storage write failures in restricted browsers.
    }
    return seeded;
  }
}

export function addNotification(notification: Omit<AppNotification, "id" | "createdAt" | "read"> & Partial<Pick<AppNotification, "id" | "createdAt" | "read">>) {
  const current = loadNotifications();
  const nextNotification: AppNotification = {
    id: notification.id || createId(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    createdAt: notification.createdAt || new Date().toISOString(),
    read: notification.read ?? false,
  };
  const next = [nextNotification, ...current.filter((item) => item.id !== nextNotification.id)];
  persistNotifications(next);
  return nextNotification;
}

export function markAllNotificationsRead() {
  const current = loadNotifications();
  const next = current.map((notification) => ({ ...notification, read: true }));
  persistNotifications(next);
  return next;
}
