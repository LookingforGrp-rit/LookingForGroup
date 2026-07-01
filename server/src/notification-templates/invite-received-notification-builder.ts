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
    const data = await prisma.memberRequests.findFirst({
      where: {
        prospectiveMemberId: receiverId,
        projectId,
      },
      select: {
        requestId: true,
        roleId: true,
        projectId: true,
        projects: {
          select: {
            title: true,
            userId: true,
            users: {
              select: { preferredName: true },
            },
          },
        },
        users: {
          select: { preferredName: true },
        },
      },
    });

    const roleData = await prisma.roles.findFirst({
      where: {
        roleId,
      },
      select: {
        label: true,
      },
    });

    const clientDomain = process.env.CLIENT_URL as string;
    const inviteLink = `${clientDomain}/acceptInvite/${String(data?.requestId)}`;
    const projectLink = `${clientDomain}/project/projectID=${String(data?.projectId)}`;
    const profileLink = `${clientDomain}/profile?userID=${String(data?.projects.userId)}`;
    const projectOwnerName = data?.projects.users.preferredName as string;

    //--BUILDING NOTIFICATION--//
    notification.receiverId = receiverId;
    notification.subjectLine = `You've been invited to join ${data?.projects.title as string}`;

    // building the message
    notification.message = `Hello ${data?.users.preferredName as string},\n\n`;
    notification.message += `You have been invited to join ${data?.projects.title as string} `;
    notification.message += `as a ${roleData?.label as string}.\n\n`;
    if (message) {
      notification.message += `The owner included a message for you:\n `;
      notification.message += `${message}\n\n`;
    }
    notification.message += `You can view ${projectOwnerName}'s profile at `;
    notification.message += `<a href="${profileLink}">${profileLink}</a> `;
    notification.message += `and you can view the project at `;
    notification.message += `<a href="${projectLink}">${projectLink}</a>. `;
    notification.message += `To accept the invite, go to `;
    notification.message += `<a href="${inviteLink}">${inviteLink}</a>. `;
    notification.message += `If you think this is a mistake, you may safely ignore this message.\n\n`;
    notification.message += `We wish you a good day!`;

    return notification;
  }
}
