import type {
  AuthenticatedRequest,
  NotificationBuilderResult,
  ModeratorNotificationInput,
} from '@looking-for-group/shared';
import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import type { NotificationBuilder } from './notification-builder.ts';

export class WarningNotificationBuilder implements NotificationBuilder {
  async buildNotification(request: Request): Promise<NotificationBuilderResult> {
    // Getting info from the request
    const req: AuthenticatedRequest = request as AuthenticatedRequest;
    const data = req.body as ModeratorNotificationInput;
    const userId = data.receiverId;
    const warning = data.message;

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
    notification.message += `A moderator has issued you a warning. `;
    notification.message += `Here is the warning provided:<br /><br />`;
    notification.message += `"${warning}"<br /><br />`;
    notification.message += `Refusing to comply may lead to further consequences, including an account ban. `;
    notification.message += `You can review our <a href="${process.env.CLIENT_URL ?? 'http://localhost:5173'}/about">Terms of Service</a>, `;
    notification.message += `or reach out to us at lookingforgrp@gmail.com<br /><br />`;
    notification.message += `We wish you a good day.<br />`;
    notification.message += `LFG Team`;

    return notification;
  }
}
