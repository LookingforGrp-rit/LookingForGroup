import type { AuthenticatedRequest, NotificationBuilderResult } from '@looking-for-group/shared';
import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import type { NotificationBuilder } from './notification-builder.ts';

export class ProjectRejectedNotificationBuilder implements NotificationBuilder {
  async buildNotification(request: Request): Promise<NotificationBuilderResult> {
    // request body shape.
    type RejectionBody = {
      reason: string;
    };

    const req: AuthenticatedRequest = request as AuthenticatedRequest;
    const projectId = parseInt(req.params.id as string);
    const notification: NotificationBuilderResult = {
      receiverId: -1,
      subjectLine: '',
      message: '',
    };

    // getting rejection reason
    const body = req.body as RejectionBody;
    const reason = body.reason;

    // getting all necessary information
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
    // receiver
    notification.receiverId = data?.userId as number;

    // subject line
    notification.subjectLine = `The approval request for your project, ${data?.title as string}, has been rejected.`;

    // building the message
    notification.message = `Hello ${data?.users.preferredName as string},\n\n`;
    notification.message += `Unfortunately, the approval request for your project, ${data?.title as string}, has been rejected. `;
    notification.message += `Here is the reason provided:\n\n`;
    notification.message += `"${reason}"\n\n`;
    notification.message += `If you wish to rerequest approval, please make the appropriate changes to your project.`;
    notification.message += `Our terms of service can be located at ${process.env.CLIENT_DOMAIN as string}/about.\n\n`;
    notification.message += `We wish you a good day.`;

    return notification;
  }
}
