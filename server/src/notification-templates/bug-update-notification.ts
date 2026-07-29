import type { AuthenticatedRequest, NotificationBuilderResult } from '@looking-for-group/shared';
import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import type { NotificationBuilder } from './notification-builder.ts';

export class BugUpdateNotificationBuilder implements NotificationBuilder {
  async buildNotification(request: Request): Promise<NotificationBuilderResult> {
    // Getting info from the request
    const req: AuthenticatedRequest = request as AuthenticatedRequest;
    const body = req.body as { isResolved: boolean; modNotes: string };
    const reportId = parseInt(req.params.id as string);

    const notification: NotificationBuilderResult = {
      receiverId: -1,
      subjectLine: '',
      message: '',
    };

    const report = await prisma.reportBug.findUnique({
      where: { reportId },
    });

    const receiver = await prisma.users.findFirst({
      where: {
        userId: report?.userId ?? -1,
      },
    });

    //--BUILDING THE NOTIFICATION--//
    notification.receiverId = receiver?.userId ?? -1;

    // subject line
    notification.subjectLine = `Update regarding your bug report`;

    // building the message
    notification.message = `Hello ${receiver?.firstName as string},<br /><br />`;
    notification.message += `A moderator has sent you an update regarding a bug report you submitted. `;
    notification.message += `The bug report in question is the following:<br /><br />`;
    notification.message += `${report?.reportText ?? ''} <br /><br />`;
    notification.message += `They have marked the bug as <strong>${body.isResolved ? 'resolved' : 'not resolved'}.</strong> `;
    notification.message += `Here is the mod's notes on the issue:<br /><br />`;
    notification.message += `${body.modNotes}<br /><br />`;
    notification.message += `If you have any questions or would like to respond to this notification, reply to <strong>lookingforgrp@gmail.com</strong>.<br /><br />`;
    notification.message += `We wish you a good day.<br />`;
    notification.message += `LFG Team`;

    return notification;
  }
}
