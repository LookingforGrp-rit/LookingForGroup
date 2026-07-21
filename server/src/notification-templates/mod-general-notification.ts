import type {
  AuthenticatedRequest,
  NotificationBuilderResult,
  ModeratorNotificationInput,
} from '@looking-for-group/shared';
import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import type { NotificationBuilder } from './notification-builder.ts';

export class ModGeneralNotificationBuilder implements NotificationBuilder {
  async buildNotification(request: Request): Promise<NotificationBuilderResult> {
    // Getting info from the request
    const req: AuthenticatedRequest = request as AuthenticatedRequest;
    const data = req.body as ModeratorNotificationInput;
    const userId = data.receiverId;
    const message = data.message;

    const notification: NotificationBuilderResult = {
      receiverId: -1,
      subjectLine: '',
      message: '',
    };

    const receiver = await prisma.users.findFirst({
      where: {
        userId: userId,
      },
    });

    //--BUILDING THE NOTIFICATION--//
    notification.receiverId = userId;

    // subject line
    notification.subjectLine = data.subjectLine;

    // building the message
    notification.message = `Hello ${receiver?.firstName as string},<br /><br />`;
    notification.message += `A moderator has sent you a notification. `;
    notification.message += `Here is the message provided:<br /><br />`;
    notification.message += `"${message}"<br /><br />`;
    notification.message += `If you have any questions or would like to respond to this notification, reply to <strong>lookingforgrp@gmail.com</strong>.<br /><br />`;
    notification.message += `We wish you a good day.<br />`;
    notification.message += `LFG Team`;

    return notification;
  }
}
