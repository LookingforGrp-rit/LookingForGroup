import type { EmailInput, UserEmail } from '@looking-for-group/shared';
import { createElement } from 'react';
import { pretty, render, toPlainText } from 'react-email';
import prisma from '#config/prisma.ts';
import DemotionEmail from '#email-templates/demotion-email.ts';
import { sendEmail } from '#services/mailer.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type DemoteModServiceError = ServiceErrorSubset<
  'INTERNAL_ERROR' | 'CONFLICT' | 'FORBIDDEN' | 'NOT_FOUND'
>;
type DemoteModServiceSuccess = ServiceSuccessSubset<'OK'>;

export const demoteModService = async (
  userId: number,
): Promise<DemoteModServiceError | DemoteModServiceSuccess> => {
  try {
    const result = await prisma.users.findFirst({
      where: { userId },
      select: {
        accessLevel: true,
        userId: true,
        firstName: true,
        lastName: true,
        ritEmail: true,
      },
    });

    if (!result) {
      return 'NOT_FOUND';
    }

    if (result.accessLevel === 'User') {
      // User cannot be demoted further
      return 'CONFLICT';
    }

    if (result.accessLevel === 'Administrator') {
      // Admin cannot be demoted
      return 'FORBIDDEN';
    }

    await prisma.users.update({
      where: { userId },
      data: { accessLevel: 'User' },
    });

    // Sending the email //
    const html = await pretty(
      await render(
        createElement(DemotionEmail, {
          receiverName: {
            firstName: result.firstName,
            lastName: result.lastName,
          },
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
      receiver: result,
      subject: `[DO NOT REPLY] You have been promoted to Moderator`,
      textBody: text,
      HTMLBody: html,
    };

    // it really shouldn't matter if the email doesn't go through.
    // They should be demoted anyway.
    await sendEmail(email);

    return 'OK';
  } catch (e) {
    console.error('There was an error is promoteUserToModService: ', e);
    return 'INTERNAL_ERROR';
  }
};
