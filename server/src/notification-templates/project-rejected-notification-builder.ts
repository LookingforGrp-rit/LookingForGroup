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
    let reason;
    if (body.reason) {
      reason = body.reason;
    }

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
    notification.message = `Hello ${data?.users.preferredName as string},<br /><br />`;
    notification.message += `Unfortunately, the approval request for your project, <strong>${data?.title as string}</strong>, has been rejected. `;
    if (reason) {
      notification.message += `Here is the reason provided:<br /><br />`;
      notification.message += `"${reason}"<br /><br />`;
    }
    notification.message += `If you wish to again request approval, please make the appropriate changes to your project. `;
    notification.message += `You can review our <a href="${process.env.CLIENT_URL ?? 'http://localhost:5173'}/about">Terms of Service</a>.<br /><br />`;
    notification.message += `We wish you a good day.<br />`;
    notification.message += `LFG Team`;

    return notification;
  }
}
