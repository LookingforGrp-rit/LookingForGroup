import type { AuthenticatedRequest, NotificationBuilderResult } from '@looking-for-group/shared';
import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import type { NotificationBuilder } from './notification-builder.ts';

/**
 * Builds a notification for the Project Approval event.
 */
export class ProjectApprovedNotificationBuilder implements NotificationBuilder {
  async buildNotification(request: Request): Promise<NotificationBuilderResult> {
    const req: AuthenticatedRequest = request as AuthenticatedRequest;
    const projectId = parseInt(req.params.id as string);
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

    // setting receiver
    notification.receiverId = data?.userId as number;

    // setting subject line
    notification.subjectLine = `Your project, ${data?.title as string}, has been approved!`;

    // building message
    let message = `Hello ${data?.users.preferredName as string},`;
    message += `\n\nYour project, ${data?.title as string}, has been approved. `;
    message += `People can now view, like, and request to join your project.`;
    message += `\n\nWe wish you luck in all your endeavors!`;

    notification.message = message;

    return notification;
  }
}
