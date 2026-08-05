import type { EmailInput, UserEmail } from '@looking-for-group/shared';
import { createElement } from 'react';
import { pretty, render, toPlainText } from 'react-email';
import prisma from '#config/prisma.ts';
import BanEmail from '#email-templates/ban-email.ts';
import type { Prisma } from '#prisma-models/index.js';
import deleteSessionsByGoogleService from '#services/authentication/delete-sessions-by-google.ts';
import { sendEmail } from '#services/mailer.ts';
import changeOwnerService from '#services/projects/members/change-owner.ts';
import getMembersService from '#services/projects/members/get-members.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';
import { getUserProjectsService } from '../get-user-proj.ts';

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

    //Change the owner of each of their projects to the oldest member of the team, if applicable
    const projects = await getUserProjectsService(userId);

    if (projects !== 'INTERNAL_ERROR' && projects !== 'NOT_FOUND') {
      if (projects.length !== 0) {
        for (let i = 0; i < projects.length; i++) {
          let members = await getMembersService(projects[i].projectId);

          if (members !== 'INTERNAL_ERROR' && members !== 'NOT_FOUND') {
            //Trying to get the oldest member
            members = members.toSorted(
              (member1, member2) => member1.memberSince.valueOf() - member2.memberSince.valueOf(),
            );
            const oldestMember = members[0];

            const projectId_userId: Prisma.MembersProjectIdUserIdCompoundUniqueInput = {
              projectId: projects[i].projectId,
              userId: oldestMember.user.userId,
            };

            await changeOwnerService(projectId_userId);
          }
        }
      }
    }

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
