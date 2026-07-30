import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';
import type { NotificationBuilder } from '../../notification-templates/notification-builder.ts';

type SendNotificationServiceError = ServiceErrorSubset<'CONFLICT' | 'INTERNAL_ERROR'>;
type SendNotificationServiceSuccess = ServiceSuccessSubset<'CREATED'>;

const sendNotificationService = async (
  builder: NotificationBuilder,
  request: Request,
  isGlobal?: boolean,
): Promise<SendNotificationServiceError | SendNotificationServiceSuccess> => {
  // notification is created in the database
  try {
    const notification = await builder.buildNotification(request);

    await prisma.notifications.create({
      data: {
        receiverId: notification.receiverId,
        subjectLine: notification.subjectLine,
        message: notification.message,
        timeSent: new Date(Date.now()),
        isGlobal: isGlobal ?? false,
      },
    });

    return 'CREATED';
  } catch (e) {
    console.error('There was an error in sendNotification: ', e);

    if (!(e instanceof Object && 'code' in e)) {
      return 'INTERNAL_ERROR';
    }

    if (e.code === 'P2003') {
      return 'CONFLICT';
    }

    return 'INTERNAL_ERROR';
  }
};

export default sendNotificationService;
