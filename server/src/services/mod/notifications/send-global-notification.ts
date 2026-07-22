import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import sendNotificationService from '#services/notifications/send-notification.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';
import type { NotificationBuilder } from '../../../notification-templates/notification-builder.ts';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

type SendNotificationServiceError = ServiceErrorSubset<'CONFLICT' | 'INTERNAL_ERROR'>;
type SendNotificationServiceSuccess = ServiceSuccessSubset<'CREATED'>;

const sendGlobalNotificationService = async (
  builder: NotificationBuilder,
  request: Request,
): Promise<SendNotificationServiceError | SendNotificationServiceSuccess> => {
  // notification is created in the database
  try {
    const userIDs = await prisma.users.findMany({
      select: {
        userId: true,
      },
    });

    const res = await Promise.all(
      userIDs.map((id) => {
        const newReq = { ...request, body: { ...request.body, receiverId: id } } as Request;
        return sendNotificationService(builder, newReq, true);
      }),
    );

    if (res.every((r) => r === 'CREATED')) return 'CREATED';
    return 'INTERNAL_ERROR';
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

export default sendGlobalNotificationService;
