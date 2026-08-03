import type { EmailInput, UserEmail } from '@looking-for-group/shared';
import { createElement } from 'react';
import { pretty, render, toPlainText } from 'react-email';
import prisma from '#config/prisma.ts';
import UnbanEmail from '#email-templates/unban-email.ts';
import { sendEmail } from '#services/mailer.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type DeleteBlacklistServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteBlacklistServiceSuccess = ServiceSuccessSubset<'OK'>;

//DELETE api/mod/unban-user/{id}
//unbans a user
const deleteBlacklistService = async (
  id: number,
): Promise<DeleteBlacklistServiceSuccess | DeleteBlacklistServiceError> => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        userId: id,
      },
    });
    if (user === null) return 'NOT_FOUND';

    await prisma.userBlacklist.delete({
      where: {
        googleId: user.googleId,
      },
    });

    // make the user's account public again
    await prisma.users.update({
      where: {
        userId: id,
      },
      data: {
        privacy: 'public',
      },
    });

    //Send email to user
    const html = await pretty(
      await render(
        createElement(UnbanEmail, {
          receiverName: {
            firstName: user.firstName,
            lastName: user.lastName,
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
      receiver: user,
      subject: `[DO NOT REPLY] You have been unbanned from Looking For Group`,
      textBody: text,
      HTMLBody: html,
    };

    const emailResult = await sendEmail(email);
    if (emailResult === 'INTERNAL_ERROR') return emailResult;

    return 'OK';
  } catch (e) {
    if (e instanceof Object && 'code' in e) {
      if (e.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }

    console.error('Error in addBlacklistService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default deleteBlacklistService;
