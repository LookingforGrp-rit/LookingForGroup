import { CreateNotification } from './NotificationSingles';

interface NotificationType {
  message: string;
  time: Date;
}

// Fake notifications for testing purposes
const notifications: NotificationType[] = [
  CreateNotification('Notification 1', new Date('2024-06-15T10:00:00Z')),
  CreateNotification('Notification 2', new Date('2024-06-12T06:00:00Z')),
  CreateNotification('Notification 3', new Date('2024-06-10T07:00:00Z')),
  CreateNotification('Notification 4', new Date('2024-06-12T05:00:00Z')),
  CreateNotification('Notification 5', new Date('2024-06-23T09:00:00Z')),
  CreateNotification('Notification 6', new Date('2024-06-22T08:00:00Z')),
  CreateNotification('Notification 7', new Date('2024-06-01T11:00:00Z')),
  CreateNotification('Notification 8', new Date('2024-07-12T12:00:00Z')),
  CreateNotification('Notification 9', new Date('2024-07-12T18:00:00Z')),
];

// Arranges notifications from newest to oldest
function SortNotifs(notifs: NotificationType[]): NotificationType[] {
  return notifs.sort((a, b) => b.time.getTime() - a.time.getTime());
}

// Converts a Date into readable 'MM-DD' format
function FormatDate(date: Date): string {
  const month = date.getMonth() + 1; // Months are 0-based
  const day = date.getDate();
  return `${month}-${day}`;
}

// Groups notifications by their formatted date
function GroupNotifsByDate(notifs: NotificationType[]): Record<string, NotificationType[]> {
  const grouped: Record<string, NotificationType[]> = {};

  notifs.forEach((notification) => {
    const formattedDate = FormatDate(notification.time);

    if (!grouped[formattedDate]) {
      grouped[formattedDate] = [];
    }

    grouped[formattedDate].push(notification);
  });

  return grouped;
}

// How the notifications are displayed
export function DisplayNotifs() {
  const sortedNotifs = SortNotifs(notifications);
  const groupedNotifs = GroupNotifsByDate(sortedNotifs);

  return (
    <>
      <h2 className="notif-header">Notifications</h2>
      {Object.keys(groupedNotifs).map((notifDate) => (
        <div key={notifDate}>
          <div className="date-sent-header">
            <p>Date: {notifDate}</p>
          </div>

          {groupedNotifs[notifDate].map((notification, index) => (
            <div className="notif-popup-boxes" key={index}>
              <p>
                {notification.message} --- Time: {notification.time.getHours()}:
                {(notification.time.getMinutes() < 10 ? '0' : '') + notification.time.getMinutes()}
              </p>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
