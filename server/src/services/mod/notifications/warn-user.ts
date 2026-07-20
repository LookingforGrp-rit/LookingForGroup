import type {
  AuthenticatedRequest,
  EmailInput,
  UserEmail,
  ModeratorNotificationInput,
} from '@looking-for-group/shared';
import { createElement } from 'react';
import { pretty, render, toPlainText } from 'react-email';
import prisma from '#config/prisma.ts';
import WarnEmail from '#email-templates/warn-email.ts';
import { WarningNotificationBuilder } from '#notification-templates/user-warn-notification.ts';
import { sendEmail } from '#services/mailer.ts';
import sendNotificationService from '#services/notifications/send-notification.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type NotificationServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;
type NotificationServiceSuccess = ServiceSuccessSubset<'CREATED'>;

//POST api/mod/notification
const warnUserService = async (
  req: AuthenticatedRequest,
): Promise<NotificationServiceError | NotificationServiceSuccess> => {
  try {
    const data = req.body as ModeratorNotificationInput;

    //check if user exists
    const user = await prisma.users.findUnique({
      where: {
        userId: data.receiverId,
      },
    });

    if (user === null) return 'NOT_FOUND';

    // Create notification
    const result = await sendNotificationService(new WarningNotificationBuilder(), req);
    if (result !== 'CREATED') return result;

    //Send email to user
    const html = await pretty(
      await render(
        createElement(WarnEmail, {
          receiverName: {
            firstName: user.firstName,
            lastName: user.lastName,
          },
          warning: data.message,
        }),
      ),
    );

    const text = toPlainText(html);

    const email: EmailInput = {
      sender: {
        ritEmail: 'lfg-team@lookingforgrp.com',
        firstName: 'Looking For Group',
        lastName: '',
      } as UserEmail,
      receiver: user,
      subject: data.subjectLine,
      textBody: text,
      HTMLBody: html,
    };

    const emailResult = await sendEmail(email);
    if (emailResult === 'INTERNAL_ERROR') return emailResult;

    return 'CREATED';
  } catch (e) {
    console.error('Error in warnUserService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default warnUserService;
