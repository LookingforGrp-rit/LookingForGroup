import type { NotificationBuilderResult } from '@looking-for-group/shared';
import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import type { NotificationBuilder } from './notification-builder.ts';

export class InviteAcceptedNotificationBuilder implements NotificationBuilder {
  async buildNotification(request: Request): Promise<NotificationBuilderResult> {
    const notification: NotificationBuilderResult = {
      receiverId: 0,
      subjectLine: '',
      message: '',
    };
    const requestId = parseInt(request.params.id as string);

    const data = await prisma.memberRequests.findFirst({
      where: { requestId },
      select: {
        roleId: true,
        projects: {
          select: {
            userId: true,
            title: true,
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

    if (!data) {
      throw new Error('something caught fire.');
    }

    const roleData = await prisma.roles.findFirst({
      where: { roleId: data.roleId },
      select: { label: true },
    });

    const projectData = data.projects;
    const ownerData = projectData.users;
    const inviteeData = data.users;
    // BUILDING THE NOTIFICATION //
    notification.receiverId = projectData.userId;
    notification.subjectLine = `${inviteeData.preferredName} has accepted your invitation to join ${projectData.title}`;

    notification.message = `Hello ${ownerData.preferredName},<br /><br />`;
    notification.message += `${inviteeData.preferredName} has accepted your invitation to join ${projectData.title} `;
    notification.message += `as a ${roleData?.label as string}. You may also assign them to other roles if need be. `;
    notification.message += `Happy building!`;
    return notification;
  }
}
