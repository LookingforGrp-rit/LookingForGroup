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
    notification.message = `Hello ${data?.users.preferredName as string},<br /><br />`;
    notification.message += `Unfortunately, your project ${data?.title as string} has been taken down. `;
    notification.message += `Here is the reason provided:<br /><br />`;
    notification.message += `"${reason}"<br /><br />`;
    notification.message += `If you wish to have this project reapproved, please make the necessary changes. `;
    notification.message += `You can review our <a href="${process.env.CLIENT_URL ?? 'http://localhost:5173'}/about">Terms of Service</a>.<br /><br />`;
    notification.message += `We wish you a good day.<br />`;
    notification.message += `LFG Team`;

    return notification;
  }
}
