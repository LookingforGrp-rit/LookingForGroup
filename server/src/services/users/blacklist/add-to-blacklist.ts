import type { EmailInput, UserEmail } from '@looking-for-group/shared';
import { createElement } from 'react';
import { pretty, render, toPlainText } from 'react-email';
import prisma from '#config/prisma.ts';
import BanEmail from '#email-templates/ban-email.ts';
import { sendEmail } from '#services/mailer.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type AddBlacklistServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;
type AddBlacklistServiceSuccess = ServiceSuccessSubset<'OK'>;

//PUT api/mod/ban-user/{id}/{reason}
//add a user to blacklist
const addBlacklistService = async (
  googleId: string,
  reason: string,
): Promise<AddBlacklistServiceSuccess | AddBlacklistServiceError> => {
  try {
    //check if user exists
    const user = await prisma.users.findUnique({
      where: {
        googleId: googleId,
      },
    });
    if (user === null) return 'NOT_FOUND';

    //Attempt to add to blacklist

    await prisma.userBlacklist.create({
      data: {
        googleId: googleId,
        banReason: reason,
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
      subject: `You have been banned from Looking For Group`,
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
