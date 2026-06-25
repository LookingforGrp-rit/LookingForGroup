import type { NotificationPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { NotificationPreviewSelector } from '#services/selectors/notifications/notification-preview.ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const notif = await prisma.notifications.findMany({
  select: NotificationPreviewSelector,
});

type NotificationsGetPayload = Awaited<typeof notif>[number];

export const transformNotificationToPreview = (
  notification: NotificationsGetPayload,
): NotificationPreview => {
  const transformedObj = {
    notificationId: notification.notificationId,
    timeSent: notification.timeSent,
    subjectLine: notification.subjectLine,
    hasBeenRead: notification.hasBeenRead,
  };
  return transformedObj;
};
