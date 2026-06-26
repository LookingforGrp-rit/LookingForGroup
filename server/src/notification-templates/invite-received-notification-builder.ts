import type {
  AuthenticatedRequest,
  NotificationBuilderResult,
  SendProjectInviteInput,
} from '@looking-for-group/shared';
import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import type { NotificationBuilder } from './notification-builder.ts';

export class InviteReceivedNotificationBuilder implements NotificationBuilder {
  async buildNotification(request: Request): Promise<NotificationBuilderResult> {
    const notification: NotificationBuilderResult = {
      receiverId: -1,
      subjectLine: '',
      message: '',
    };

    const req: AuthenticatedRequest = request as AuthenticatedRequest;
    const body: SendProjectInviteInput = req.body as SendProjectInviteInput;

    const receiverId = body.prospectiveMemberId;
    const roleId = body.roleId;
    const message = body.message;
    const projectId = parseInt(req.params.id as string);

    //--GETTING DATA FROM DB--//
    const projectData = await prisma.projects.findFirst({
      where: { projectId },
      select: {
        title: true,
        users: {
          select: {
            preferredName: true,
          },
        },
        members: {
          where: {
            roleId,
          },
          select: {
            roles: {
              select: {
                label: true,
              },
            },
          },
        },
      },
    });

    const userData = await prisma.users.findFirst({
      where: { userId: receiverId },
      select: {
        preferredName: true,
      },
    });

    const requestId = await prisma.memberRequests.findFirst({
      where: {
        prospectiveMemberId: receiverId,
        projectId,
      },
      select: {
        requestId: true,
      },
    });

    const inviteLink = `${process.env.CLIENT_URL as string}/acceptInvite/${String(requestId?.requestId)}`;

    //--BUILDING NOTIFICATION--//
    notification.receiverId = receiverId;
    notification.subjectLine = `You've been invited to join ${projectData?.title as string}`;

    // building the message
    notification.message = `Hello ${userData?.preferredName as string},\n\n`;
    notification.message += `You have been invited to join ${projectData?.title as string} `;
    notification.message += `as its ${projectData?.members[0].roles.label as string}.\n\n`;
    if (message) {
      notification.message += `The owner included a message for you: `;
      notification.message += `${message}\n\n`;
    }
    notification.message += `To accept the invite, go to ${inviteLink}. `;
    notification.message += `If you think this is a mistake, you may safely ignore this message.\n\n`;
    notification.message += `We wish you a good day!`;

    return notification;
  }
}
