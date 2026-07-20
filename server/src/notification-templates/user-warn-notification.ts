import type { AuthenticatedRequest, NotificationBuilderResult } from '@looking-for-group/shared';
import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import type { NotificationBuilder } from './notification-builder.ts';

export class WarningNotificationBuilder implements NotificationBuilder {
  async buildNotification(request: Request): Promise<NotificationBuilderResult> {
    type Warning = {
      warning: string;
    };

    // Getting info from the request
    const req: AuthenticatedRequest = request as AuthenticatedRequest;
    const userId = parseInt(req.params.id as string);
    const body = req.body as Warning;
    const warning = body.warning;

    const notification: NotificationBuilderResult = {
      receiverId: -1,
      subjectLine: '',
      message: '',
    };

    const data = await prisma.users.findFirst({
      where: {
        userId: userId,
      },
    });

    //--BUILDING THE NOTIFICATION--//
    notification.receiverId = data?.userId as number;

    // subject line
    notification.subjectLine = `You have been issued a warning`;

    // building the message
    notification.message = `Hello ${data?.firstName as string},<br /><br />`;
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
