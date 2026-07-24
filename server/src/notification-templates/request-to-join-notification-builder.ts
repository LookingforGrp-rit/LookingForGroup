import type {
  AuthenticatedRequest,
  NotificationBuilderResult,
  RequestToJoinInput,
} from '@looking-for-group/shared';
import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import type { NotificationBuilder } from './notification-builder.ts';

export class RequestToJoinNotificationBuilder implements NotificationBuilder {
  async buildNotification(request: Request): Promise<NotificationBuilderResult> {
    const notification: NotificationBuilderResult = {
      receiverId: -1,
      subjectLine: '',
      message: '',
    };

    const req: AuthenticatedRequest = request as AuthenticatedRequest;
    const body: RequestToJoinInput = req.body as RequestToJoinInput;
    const projectId = parseInt(req.params.id as string);
    const prospectiveMemberId = body.prospectiveMemberId;

    //--GETTING DATA FROM DB--//
    const data = await prisma.memberRequests.findFirst({
      where: {
        projectId,
        prospectiveMemberId,
      },
      select: {
        requestId: true,
        roleId: true,
        users: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        projects: {
          select: {
            title: true,
            users: {
              select: { firstName: true },
            },
          },
        },
      },
    });

    if (!data) {
      throw new Error('something caught fire');
    }

    const roleData = await prisma.roles.findFirst({
      where: { roleId: data.roleId },
      select: { label: true },
    });

    const projectTitle = data.projects.title;
    const ownerName = data.projects.users.firstName;
    const requesterName = data.users.firstName;
    const requesterLastName = data.users.lastName;
    const requesterUsername = data.users.username;
    const roleName = roleData?.label;
    const requesterProfileLink = `${process.env.CLIENT_URL ?? 'http://localhost:5173'}/profile?userID=${prospectiveMemberId.toString()}`;
    const acceptRequestLink = `${process.env.CLIENT_URL ?? 'http://localhost:5173'}/acceptApplication/${data.requestId.toString()}`;

    //--BUILDING NOTIFICATION--//
    notification.receiverId = body.ownerUserId;
    notification.subjectLine = `Request to join ${projectTitle} from ${requesterName}`;

    // building message
    notification.message = `Hello ${ownerName},<br /><br />`;
    notification.message += `<strong>${requesterName} ${requesterLastName}</strong> (${requesterUsername}@g.rit.edu) `;
    notification.message += `has requested to join your project <strong>${projectTitle}</strong> as a <strong>${roleName as string}</strong>.<br /><br />  `;
    if (body.message) {
      notification.message += `${requesterName} has provided a message:<br />`;
      notification.message += `"${body.message}"<br /><br />`;
    }
    notification.message += `You may view the `;
    notification.message += `<a href="${requesterProfileLink}">requester's profile</a>.<br /><br />`;
    notification.message += `To respond to the application, `;
    notification.message += `<a href="${acceptRequestLink}">click here</a>.<br /><br />`;
    notification.message += `If you think this is a mistake, you may safely ignore this message.<br /><br />`;
    notification.message += `We wish you a good day!<br />`;
    notification.message += `LFG Team`;

    return notification;
  }
}
