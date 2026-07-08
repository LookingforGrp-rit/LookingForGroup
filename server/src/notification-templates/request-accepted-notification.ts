import type { NotificationBuilderResult } from '@looking-for-group/shared';
import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import type { NotificationBuilder } from './notification-builder.ts';

export class RequestAcceptedNotificationBuilder implements NotificationBuilder {
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
            title: true,
          },
        },
        users: {
          select: {
            preferredName: true,
            userId: true,
          },
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
    const inviteeData = data.users;
    // BUILDING THE NOTIFICATION //
    notification.receiverId = inviteeData.userId;
    notification.subjectLine = `Your request to join ${projectData.title} has been accepted!`;

    notification.message = `Hello ${inviteeData.preferredName},<br /><br />`;
    notification.message += `Your request to join ${projectData.title} as a ${roleData?.label as string} has been accepted. `;
    notification.message += `Happy building!`;
    return notification;
  }
}
