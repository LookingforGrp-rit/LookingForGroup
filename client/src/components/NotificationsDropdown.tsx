import { useEffect, useState } from "react";
import { Dropdown, DropdownButton, DropdownContent } from "./Dropdown";
import { useNotifications } from "../hooks/useNotifications";
import { getNotification } from "../api/notifications";
import type {
  NotificationPreview,
  NotificationDetail,
} from "@looking-for-group/shared";

type NotificationsDropdownProps = {
  /** Only fetch/poll while a user is logged in. */
  enabled: boolean;
  /** Current theme, used to pick the light/dark bell icon. */
  theme: string;
};

/** Compact relative-time label, e.g. "just now", "5m", "3h", "2d", or a date. */
const formatRelativeTime = (value: Date | string): string => {
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(value).toLocaleDateString();
};

type PanelProps = {
  notifications: NotificationPreview[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

/**
 * The dropdown panel. Because <DropdownContent> only renders its children while
 * open, this component mounting == the dropdown opening, so we refresh here.
 */
const NotificationsPanel: React.FC<PanelProps> = ({
  notifications,
  loading,
  error,
  refresh,
  markRead,
  remove,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, NotificationDetail>>({});

  // Mount === open: pull the latest list whenever the dropdown opens.
  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open/close a notification: marks it read and lazily loads its message body
  // (previews don't include the message, so we fetch the detail on demand).
  const handleSelect = async (n: NotificationPreview) => {
    if (expandedId === n.notificationId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(n.notificationId);
    if (!n.hasBeenRead) void markRead(n.notificationId);
    if (!details[n.notificationId]) {
      const res = await getNotification(n.notificationId);
      if (res.status === 200 && res.data) {
        setDetails((prev) => ({ ...prev, [n.notificationId]: res.data! }));
      }
    }
  };

  return (
    <div id="notifications-panel">
      <div className="notifications-header">
        <span>Notifications</span>
      </div>

      {loading && notifications.length === 0 ? (
        <div className="notifications-empty">Loading...</div>
      ) : error ? (
        <div className="notifications-empty notifications-error">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="notifications-empty">You're all caught up.</div>
      ) : (
        <ul className="notifications-list">
          {notifications.map((n) => (
            <li
              key={n.notificationId}
              className={`notification-item ${n.hasBeenRead ? "" : "unread"}`}
            >
              <button
                type="button"
                className="notification-main"
                onClick={() => void handleSelect(n)}
              >
                {!n.hasBeenRead && <span className="notification-dot" aria-hidden />}
                <span className="notification-text">
                  <span className="notification-subject">{n.subjectLine}</span>
                  {expandedId === n.notificationId &&
                    details[n.notificationId] && (
                      <span className="notification-message">
                        {details[n.notificationId].message}
                      </span>
                    )}
                </span>
                <span className="notification-time">
                  {formatRelativeTime(n.timeSent)}
                </span>
              </button>
              <button
                type="button"
                className="notification-delete"
                aria-label="Delete notification"
                onClick={() => void remove(n.notificationId)}
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * Bell icon with an unread badge that opens a dropdown list of the current
 * user's notifications. Pull-only against the existing backend API.
 */
export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  enabled,
  theme,
}) => {
  const {
    notifications,
    hasUnread,
    unreadCount,
    loading,
    error,
    refresh,
    markRead,
    remove,
  } = useNotifications(enabled);

  if (!enabled) return null;

  const bellSrc = theme === "light" ? "/assets/bell_light.png" : "/assets/bell_dark.png";

  return (
    <Dropdown>
      <DropdownButton buttonId="notif-btn">
        <span className="notif-bell-wrapper">
          <img src={bellSrc} alt="Notifications" />
          {hasUnread && (
            <span className="notif-badge">
              {unreadCount > 0 ? (unreadCount > 9 ? "9+" : unreadCount) : ""}
            </span>
          )}
        </span>
      </DropdownButton>
      <DropdownContent rightAlign={true}>
        <NotificationsPanel
          notifications={notifications}
          loading={loading}
          error={error}
          refresh={refresh}
          markRead={markRead}
          remove={remove}
        />
      </DropdownContent>
    </Dropdown>
  );
};

export default NotificationsDropdown;
