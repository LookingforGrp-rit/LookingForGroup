import type { NotificationBuilderResult, SendProjectInviteInput } from '@looking-for-group/shared';
import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import type { NotificationBuilder } from './notification-builder.ts';

/**
 * Builds the in-app notification sent to a user when they are invited to a
 * project. The actual accept/decline happens via the emailed link, so the
 * notification just points the user there.
 */
export class InviteMessageBuilder implements NotificationBuilder {
  async buildNotification(request: Request): Promise<NotificationBuilderResult> {
    const projectId = parseInt(request.params.id as string);
    const body = request.body as SendProjectInviteInput;

    const notification: NotificationBuilderResult = {
      receiverId: body.prospectiveMemberId,
      subjectLine: '',
      message: '',
    };

    const data = await prisma.projects.findFirst({
      where: { projectId },
      select: { title: true },
    });

    notification.subjectLine = `You've been invited to join ${data?.title ?? 'a project'}`;
    notification.message = 'Accept the invite via email.';

    return notification;
  }
}
