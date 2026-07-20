import type { AuthenticatedRequest, EmailInput, UserEmail } from '@looking-for-group/shared';
import { createElement } from 'react';
import { pretty, render, toPlainText } from 'react-email';
import prisma from '#config/prisma.ts';
import WarnEmail from '#email-templates/warn-email.ts';
import { WarningNotificationBuilder } from '#notification-templates/user-warn-notification.ts';
import { sendEmail } from '#services/mailer.ts';
import sendNotificationService from '#services/notifications/send-notification.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type AddBlacklistServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;
type AddBlacklistServiceSuccess = ServiceSuccessSubset<'CREATED'>;

//Checks if a user is on the blacklist
//To be used when they attempt to log in

//NOTE: OK means they ARE blacklisted, so they should NOT be able to sign in!
//Likewise, NOT_FOUND means they are NOT blacklisted, so they SHOULD be able to sign in
const warnUserService = async (
  req: AuthenticatedRequest,
): Promise<AddBlacklistServiceSuccess | AddBlacklistServiceError> => {
  try {
    type Warning = {
      warning: string;
    };
    const body = req.body as Warning;
    const warning = body.warning;

    const result = await sendNotificationService(new WarningNotificationBuilder(), req);
    if (result !== 'CREATED') return result;

    //check if user exists
    const user = await prisma.users.findUnique({
      where: {
        userId: parseInt(req.params.id as string),
      },
    });

    if (user === null) return 'NOT_FOUND';

    //Send email to user
    const html = await pretty(
      await render(
        createElement(WarnEmail, {
          receiverName: {
            firstName: user.firstName,
            lastName: user.lastName,
          },
          warning: warning,
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
      subject: `You have been warned on Looking For Group`,
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
