import { useCallback, useEffect, useRef, useState } from "react";
import type { NotificationPreview } from "@looking-for-group/shared";
import {
  getNotifications,
  readNotification,
  deleteNotification,
} from "../api/notifications";

// How often to refresh the notification list while enabled. The backend is
// pull-only (no websockets), so polling is how the bell badge — including its
// unread count — stays live without the user reopening the dropdown.
const UNREAD_POLL_MS = 60_000;

export interface UseNotificationsResult {
  /** The current user's notifications, newest first. */
  notifications: NotificationPreview[];
  /** True if at least one notification is unread (drives the bell badge dot). */
  hasUnread: boolean;
  /** Count of unread notifications in the loaded list (drives a numeric badge). */
  unreadCount: number;
  /** True while the full list is being (re)fetched. */
  loading: boolean;
  /** Last error message, if any. */
  error: string | null;
  /** Re-fetch the full notification list. Call when opening the dropdown. */
  refresh: () => Promise<void>;
  /** Mark one as read (optimistic). */
  markRead: (id: string) => Promise<void>;
  /** Delete one (optimistic). */
  remove: (id: string) => Promise<void>;
}

/**
 * Manages the current user's notifications for the bell UI.
 *
 *
 *
 * @param enabled - only fetch/poll while true (i.e. a user is logged in)
 */
export const useNotifications = (enabled: boolean): UseNotificationsResult => {
  const [notifications, setNotifications] = useState<NotificationPreview[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guards against setting state after unmount / between renders.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.hasBeenRead).length;

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    const res = await getNotifications();
    if (!mounted.current) return;
    if (res.status === 200 && Array.isArray(res.data)) {
      setNotifications(res.data);
      setHasUnread(res.data.some((n) => !n.hasBeenRead));
    } else {
      setError(res.error ?? "Failed to load notifications");
    }
    setLoading(false);
  }, [enabled]);

  const markRead = useCallback(async (id: string) => {
    // Optimistic: flip it read locally first.
    setNotifications((prev) => {
      const next = prev.map((n) =>
        n.notificationId === id ? { ...n, hasBeenRead: true } : n
      );
      setHasUnread(next.some((n) => !n.hasBeenRead));
      return next;
    });
    const res = await readNotification(id);
    // On failure, reconcile with the server so we don't lie to the user.
    if (mounted.current && res.error) void refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    let removed: NotificationPreview | undefined;
    setNotifications((prev) => {
      removed = prev.find((n) => n.notificationId === id);
      const next = prev.filter((n) => n.notificationId !== id);
      setHasUnread(next.some((n) => !n.hasBeenRead));
      return next;
    });
    const res = await deleteNotification(id);
    // Roll back on failure.
    if (mounted.current && res.error && removed) void refresh();
  }, [refresh]);

  // Poll the full list while enabled so the badge count stays live. Clears
  // itself when disabled/unmounted.
  useEffect(() => {
    if (!enabled) {
      setNotifications([]);
      setHasUnread(false);
      return;
    }
    void refresh();
    const interval = window.setInterval(() => void refresh(), UNREAD_POLL_MS);
    return () => window.clearInterval(interval);
  }, [enabled, refresh]);

  return {
    notifications,
    hasUnread,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    remove,
  };
};

export default useNotifications;
