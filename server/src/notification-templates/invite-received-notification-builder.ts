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
        roleId,
        requestStatus: 'Pending',
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
              select: { firstName: true },
            },
          },
        },
        users: {
          select: { firstName: true },
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

    const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173';
    const inviteLink = `${clientUrl}/acceptInvite/${String(data?.requestId)}`;
    const projectLink = `${clientUrl}/project?projectID=${String(data?.projectId)}`;
    const profileLink = `${clientUrl}/profile?userID=${String(data?.projects.userId)}`;
    const projectOwnerName = data?.projects.users.firstName as string;

    //--BUILDING NOTIFICATION--//
    notification.receiverId = receiverId;
    notification.subjectLine = `You've been invited to join ${data?.projects.title as string}`;

    // building the message
    notification.message = `Hello ${data?.users.firstName as string},<br /><br />`;
    notification.message += `You have been invited to join <strong>${data?.projects.title as string}</strong> `;
    notification.message += `as a <strong>${roleData?.label as string}</strong>.<br /><br />`;
    if (message) {
      notification.message += `${projectOwnerName} included a message for you:<br /> `;
      notification.message += `${message}<br /><br />`;
    }
    notification.message += `You can view <a href="${profileLink}">${projectOwnerName}'s profile</a> `;
    notification.message += `and the <a href="${projectLink}">project page</a>.<br /><br />`;
    notification.message += `To accept the invite, click <a href="${inviteLink}">here</a>.<br /><br />`;
    notification.message += `If you think this is a mistake, you may safely ignore this message.<br /><br />`;
    notification.message += `We wish you a good day!<br />`;
    notification.message += `LFG Team`;

    return notification;
  }
}
