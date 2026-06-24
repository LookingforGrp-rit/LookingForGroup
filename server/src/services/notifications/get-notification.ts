import type { NotificationDetail } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { NotificationDetailSelector } from '#services/selectors/notifications/notification-detail.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetNotificationServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const getNotificationService = async (
  notificationId: string,
  receiverId: number,
): Promise<NotificationDetail | GetNotificationServiceError> => {
  try {
    const result = await prisma.notifications.findFirst({
      select: NotificationDetailSelector,
      where: {
        notificationId,
        receiverId,
      },
    });

    if (result === null) {
      return 'NOT_FOUND';
    }

    return result;
  } catch (e) {
    console.error('There was an error in getNotificationService: ', e);
    return 'INTERNAL_ERROR';
  }
};

export default getNotificationService;
