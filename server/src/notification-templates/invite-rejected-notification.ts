import type { NotificationBuilderResult } from '@looking-for-group/shared';
import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import type { NotificationBuilder } from './notification-builder.ts';

export class InviteRejectedNotificationBuilder implements NotificationBuilder {
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
    notification.subjectLine = `${inviteeData.preferredName} has turned down your invitation to join ${projectData.title}`;

    notification.message = `Hello ${ownerData.preferredName},<br /><br />`;
    notification.message += `<strong>${inviteeData.preferredName}</strong> has turned down your invitation to join <strong>${projectData.title}</strong> `;
    notification.message += `as a <strong>${roleData?.label as string}</strong>.<br /><br />`;
    notification.message += `We wish you the best with your project!<br />`;
    notification.message += `LFG Team`;
    return notification;
  }
}
