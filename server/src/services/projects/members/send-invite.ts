import type { SendProjectInviteInput, EmailInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import getRolesService from '#services/datasets/get-roles.ts';
import { sendEmail } from '#services/mailer.ts';
import getProjectByIdService from '#services/projects/get-proj-id.ts';
import { UserEmailSelector } from '#services/selectors/users/parts/user-email.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type SendInviteServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;
type SendInviteServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

//POST api/projects/{id}/members/invite
//sends an invite to a user to join a project
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
      where: { userId: data.inviterUserId },
      select: UserEmailSelector,
    });

    if (!inviter) {
      return 'NOT_FOUND';
    }

    const invitee = await prisma.users.findUnique({
      where: { userId: data.inviteeUserId },
      select: UserEmailSelector,
    });

    if (!invitee) {
      return 'NOT_FOUND';
    }

    const project = await getProjectByIdService(projectId);

    if (project === 'INTERNAL_ERROR' || project === 'NOT_FOUND') {
      return project;
    }

    const msg = data.message.length === 0 ? 'No message included.' : data.message;

    const clientUrl = process.env.CLIENT_URL ?? '';

    const inviteUrl =
      `${clientUrl}/projects/${String(projectId)}/members/invite` +
      `?userId=${String(invitee.userId)}` +
      `&roleId=${String(role.roleId)}`;

    const email: EmailInput = {
      inviter: inviter,
      invitee: invitee,
      subject: `Invitation to join ${project.title}`,
      textBody: `
                Hello ${invitee.firstName},
                \n\n
                You've been invited to join the project "${project.title}" as a ${role.label} by ${inviter.firstName} ${inviter.lastName}. 
                If you don't want to join the project or believe this is a mistake, you may safely ignore this email.
                \n
                Here is the message from the inviter if they included one:
                \n
                ${msg}
                \n
                Click the link below to view the project and accept the invite:
                \n
                ${inviteUrl}
                \n\n
                Best,
                \n
                Looking For Group Team`,
      HTMLBody: `
                <div>
                  <p>Hello ${invitee.firstName},</p>
                  <p>
                    You've been invited to join the project "<strong>${project.title}</strong>"
                    as a <strong>${role.label}</strong> by
                    ${inviter.firstName} ${inviter.lastName}.
                  </p>
                  <p>
                    If you don't want to join the project or believe this is a mistake,
                    you may safely ignore this email.
                  </p>
                  <p>Here is the message from the inviter if they included one:</p>
                  <p>${msg}</p>
                  <p>Click the link below to view the project and accept the invite:</p>
                  <a href="${inviteUrl}" target="_blank">
                    Accept Invite to Join ${project.title}
                  </a>
                  <p>
                    Best,<br>
                    Looking For Group Team
                  </p>
                </div>`,
    };

    const emailResult = await sendEmail(email);
    if (emailResult === 'INTERNAL_ERROR') {
      return emailResult;
    }

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
