import type { EmailInput, UserEmail } from '@looking-for-group/shared';
import { createElement } from 'react';
import { pretty, render, toPlainText } from 'react-email';
import prisma from '#config/prisma.ts';
import BanEmail from '#email-templates/ban-email.ts';
import deleteSessionsByGoogleService from '#services/authentication/delete-sessions-by-google.ts';
import { sendEmail } from '#services/mailer.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type AddBlacklistServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;
type AddBlacklistServiceSuccess = ServiceSuccessSubset<'OK'>;

//PUT api/mod/ban-user/{id}
//add a user to blacklist
const addBlacklistService = async (
  userId: number,
  reason: string,
): Promise<AddBlacklistServiceSuccess | AddBlacklistServiceError> => {
  try {
    //check if user exists
    const user = await prisma.users.findUnique({
      where: {
        userId,
      },
    });
    if (user === null) return 'NOT_FOUND';

    //Attempt to add to blacklist
    await prisma.userBlacklist.create({
      data: {
        googleId: user.googleId,
        banReason: reason,
      },
    });

    //Log the user out of every session they have open
    const sessionResult = await deleteSessionsByGoogleService(user.googleId);

    if (sessionResult === 'INTERNAL_ERROR') return sessionResult;

    // make banned user's account private
    await prisma.users.update({
      where: {
        userId,
      },
      data: {
        privacy: 'private',
      },
    });

    //Send email to user
    const html = await pretty(
      await render(
        createElement(BanEmail, {
          receiverName: {
            firstName: user.firstName,
            lastName: user.lastName,
          },
          banReason: reason,
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
      subject: `[DO NOT REPLY] You have been banned from Looking For Group`,
      textBody: text,
      HTMLBody: html,
    };

    const emailResult = await sendEmail(email);

    if (emailResult === 'INTERNAL_ERROR') return emailResult;

    return 'OK';
  } catch (e) {
    if (e instanceof Object && 'code' in e) {
      if (e.code === 'P2002') {
        return 'CONFLICT';
      }
    }

    console.error('Error in addBlacklistService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default addBlacklistService;
