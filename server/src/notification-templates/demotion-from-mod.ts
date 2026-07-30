import type { NotificationBuilderResult } from '@looking-for-group/shared';
import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import type { NotificationBuilder } from './notification-builder.ts';

export class DemotionFromModNotificationBuilder implements NotificationBuilder {
  async buildNotification(request: Request): Promise<NotificationBuilderResult> {
    type DemotionBody = {
      userId: number;
    };
    const notification: NotificationBuilderResult = {
      receiverId: -1,
      subjectLine: ``,
      message: ``,
    };
    const demoteeId = (request.body as unknown as DemotionBody).userId;

    const data = await prisma.users.findFirst({
      where: { userId: demoteeId },
      select: {
        firstName: true,
      },
    });

    if (!data) {
      throw new Error('DB caught fire.');
    }

    // Receiver
    notification.receiverId = demoteeId;

    // Subject Line
    notification.subjectLine = `You have been demoted from Moderator`;

    // Message
    notification.message = `Hello ${data.firstName},<br /><br />`;
    notification.message += `You have been demoted from your Moderator Position. `;
    notification.message += `You may no longer review bugs, reports, and projects, or ban users.<br /><br />`;
    notification.message += `We wish you well.<br />`;
    notification.message += `LFG Team`;

    return notification;
  }
}
