import type { NotificationPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { NotificationPreviewSelector } from '#services/selectors/notifications/notification-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformNotificationToPreview } from '#services/transformers/notifications/notification-preview.ts';

type GetNotificationServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

// this will be a thing at some point
const getNotificationsService = async (
  userId: number,
): Promise<NotificationPreview[] | GetNotificationServiceError> => {
  try {
    const result = await prisma.notifications.findMany({
      select: NotificationPreviewSelector,
      orderBy: {
        timeSent: 'desc',
      },
      where: {
        receiverId: userId,
      },
    });

    const notifications = result.map(transformNotificationToPreview);
    return notifications;
  } catch (e) {
    console.error('There was an error at getNotificationService: ', e);
    return 'INTERNAL_ERROR';
  }
};

export default getNotificationsService;
