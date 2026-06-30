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
            preferredName: true,
            lastName: true,
            username: true,
          },
        },
        projects: {
          select: {
            title: true,
            users: {
              select: { preferredName: true },
            },
          },
        },
      },
    });

    const roleData = await prisma.roles.findFirst({
      where: { roleId: data?.roleId },
      select: { label: true },
    });

    const projectTitle = data?.projects.title as string;
    const ownerName = data?.projects.users.preferredName as string;
    const requesterName = data?.users.preferredName as string;
    const requesterLastName = data?.users.lastName as string;
    const requesterUsername = data?.users.username as string;
    const roleName = roleData?.label as string;
    const requesterProfileLink = `${process.env.CLIENT_URL as string}/profile?userID=${prospectiveMemberId.toString()}`;
    const acceptRequestLink = `$`;

    //--BUILDING NOTIFICATION--//
    notification.receiverId = body.ownerUserId;
    notification.subjectLine = `Request to join ${projectTitle} from ${requesterName}`;

    // building message
    notification.message = `Hello ${ownerName},\n\n`;
    notification.message += `${requesterName} ${requesterLastName} (${requesterUsername}@g.rit.edu) `;
    notification.message += `has requested to join your project ${projectTitle} as a ${roleName}.\n\n  `;
    if (body.message) {
      notification.message += `${requesterName} has provided a message:\n`;
      notification.message += body.message;
    }
    notification.message += `You may view the requester's profile at `;
    notification.message += `<a href="${requesterProfileLink}">${requesterProfileLink}</a>. `;
    notification.message += `You may respond to their invite by going to `;
    notification.message += `<a href=${acceptRequestLink}>${acceptRequestLink}</a>.`;

    return notification;
  }
}
