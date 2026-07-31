import type { EmailInput, UserEmail } from '@looking-for-group/shared';
import { createElement } from 'react';
import { pretty, render, toPlainText } from 'react-email';
import prisma from '#config/prisma.ts';
import promotionEmail from '#email-templates/promotion-email.ts';
import { sendEmail } from '#services/mailer.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type PromoteUserToModServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'CONFLICT' | 'NOT_FOUND'>;
type PromoteUserToModServiceSuccess = ServiceSuccessSubset<'OK'>;

export const promoteUserToModService = async (
  userId: number,
): Promise<PromoteUserToModServiceError | PromoteUserToModServiceSuccess> => {
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

    if (result.accessLevel === 'Moderator' || result.accessLevel === 'Administrator') {
      // User already has mod perms!
      return 'CONFLICT';
    }

    await prisma.users.update({
      where: { userId },
      data: { accessLevel: 'Moderator' },
    });

    // Sending the email //
    const html = await pretty(
      await render(
        createElement(promotionEmail, {
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
    // They should be promoted anyway.
    await sendEmail(email);

    return 'OK';
  } catch (e) {
    console.error('There was an error is promoteUserToModService: ', e);
    return 'INTERNAL_ERROR';
  }
};
