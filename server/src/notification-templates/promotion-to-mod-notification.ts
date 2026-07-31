import type { NotificationBuilderResult } from '@looking-for-group/shared';
import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import type { NotificationBuilder } from './notification-builder.ts';

export class PromotionToModNotificationBuilder implements NotificationBuilder {
  async buildNotification(request: Request): Promise<NotificationBuilderResult> {
    type PromotionBody = {
      userId: number;
    };
    const notification: NotificationBuilderResult = {
      receiverId: -1,
      subjectLine: ``,
      message: ``,
    };
    const promoteeId = (request.body as unknown as PromotionBody).userId;

    const data = await prisma.users.findFirst({
      where: { userId: promoteeId },
      select: {
        firstName: true,
      },
    });

    if (!data) {
      throw new Error('DB caught fire.');
    }

    // Receiver
    notification.receiverId = promoteeId;

    // Subject Line
    notification.subjectLine = `You have been promoted to Moderator`;

    // Message
    notification.message = `Hello ${data.firstName},<br /><br />`;
    notification.message += `You have been promoted to Moderator. `;
    notification.message += `You may now review bugs, reports, and projects, as well as ban users. `;
    notification.message += `You have a duty to use this power responsibly. Being irresponsible will result in demotion.`;
    notification.message += `<br/><br/>`;
    notification.message += `Good luck, and we wish you the best!<br />`;
    notification.message += `LFG Team`;

    return notification;
  }
}
