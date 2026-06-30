import type { AuthenticatedRequest, NotificationBuilderResult } from '@looking-for-group/shared';
import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import type { NotificationBuilder } from './notification-builder.ts';

export class ProjectUnapprovedNotificationBuilder implements NotificationBuilder {
  async buildNotification(request: Request): Promise<NotificationBuilderResult> {
    type TakedownBody = {
      reason: string;
    };

    // Getting info from the request
    const req: AuthenticatedRequest = request as AuthenticatedRequest;
    const projectId = parseInt(req.params.id as string);
    const body = req.body as TakedownBody;
    const reason = body.reason;

    const notification: NotificationBuilderResult = {
      receiverId: -1,
      subjectLine: '',
      message: '',
    };

    const data = await prisma.projects.findFirst({
      where: { projectId },
      select: {
        userId: true,
        title: true,
        users: {
          select: {
            preferredName: true,
          },
        },
      },
    });

    //--BUILDING THE NOTIFICATION--//
    notification.receiverId = data?.userId as number;

    // subject line
    notification.subjectLine = `Your project, ${data?.title as string}, has been taken down.`;

    // building the message
    notification.message = `Hello ${data?.users.preferredName as string},\n\n`;
    notification.message += `Unfortunately, your project ${data?.title as string} has been taken down. `;
    notification.message += `Here is the reason provided:\n\n`;
    notification.message += `${reason}\n\n`;
    notification.message += `If you wish to have this project reapproved, please make the necessary changes. `;
    notification.message += `Our terms of service can be located at ${process.env.CLIENT_DOMAIN as string}/about.\n\n`;
    notification.message += `We wish you a good day.`;

    return notification;
  }
}
