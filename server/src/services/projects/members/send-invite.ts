import type { SendProjectInviteInput, EmailInput } from '@looking-for-group/shared';
import { createElement } from 'react';
import { pretty, render, toPlainText } from 'react-email';
import prisma from '#config/prisma.ts';
import InviteEmail from '#email-templates/invite-email.ts';
import getRolesService from '#services/datasets/get-roles.ts';
import { sendEmail } from '#services/mailer.ts';
import getProjectByIdService from '#services/projects/get-proj-id.ts';
import { UserEmailSelector } from '#services/selectors/users/parts/user-email.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type SendInviteServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;
type SendInviteServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

// Used in addMemberService
// sends an invite to a user to join a project
const sendInviteService = async (
  projectId: number,
  data: SendProjectInviteInput,
): Promise<SendInviteServiceSuccess | SendInviteServiceError> => {
  try {
    const roles = await getRolesService();

    if (roles === 'INTERNAL_ERROR') {
      return roles;
    }

    const role = roles.find((r) => r.roleId === data.roleId);

    if (!role) {
      return 'NOT_FOUND';
    }

    const inviter = await prisma.users.findUnique({
      where: { userId: data.ownerUserId },
      select: UserEmailSelector,
    });

    if (!inviter) {
      return 'NOT_FOUND';
    }

    const invitee = await prisma.users.findUnique({
      where: { userId: data.prospectiveMemberId },
      select: UserEmailSelector,
    });

    if (!invitee) {
      return 'NOT_FOUND';
    }

    const project = await getProjectByIdService(projectId);

    if (project === 'INTERNAL_ERROR' || project === 'NOT_FOUND') {
      return project;
    }

    const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173';

    const inviteUrl = `${clientUrl}/projects/${String(projectId)}/members/${String(role.roleId)}/invite`;

    const receiverImg = invitee.profileImage
      ? `https://lookingforgrp.com${invitee.profileImage}`
      : 'https://lookingforgrp.com/api/images/blue_frog.png';

    const projectImg = project.thumbnail
      ? `https://lookingforgrp.com${project.thumbnail.image}`
      : 'https://lookingforgrp.com/api/images/project_temp.png';

    const html = await pretty(
      await render(
        createElement(InviteEmail, {
          receiverName: {
            firstName: invitee.firstName,
            lastName: invitee.lastName,
          },
          receiverImage: receiverImg,
          senderName: {
            firstName: inviter.firstName,
            lastName: inviter.lastName,
          },
          senderEmail: inviter.ritEmail,
          senderMessage: data.message,
          projectName: project.title,
          projectImage: projectImg,
          inviteLink: inviteUrl,
        }),
      ),
    );

    const text = toPlainText(html);

    const email: EmailInput = {
      sender: inviter,
      receiver: invitee,
      subject: `Invitation to join ${project.title}`,
      textBody: text,
      HTMLBody: html,
    };

    const emailResult = await sendEmail(email);
    if (emailResult === 'INTERNAL_ERROR') {
      return emailResult;
    }

    //TODO: Update database
    return 'NO_CONTENT';
  } catch (e) {
    if (e instanceof Object && 'code' in e) {
      if (e.code === 'P2025') {
        return 'NOT_FOUND';
      }

      if (e.code === 'P2002') {
        return 'CONFLICT';
      }
    }

    console.error('Error in sendInviteService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default sendInviteService;
