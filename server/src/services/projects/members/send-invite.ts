import type { SendProjectInviteInput, EmailInput, UserEmail } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import getRolesService from '#services/datasets/get-roles.ts';
import { sendEmail } from '#services/mailer.ts';
import { UserEmailSelector } from '#services/selectors/users/parts/user-email.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';
import getProjectByIdService from '../get-proj-id.ts';

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

    const invitee = await prisma.users.findUnique({
      where: { userId: data.inviteeUserId },
      select: UserEmailSelector,
    });

    if (!invitee) {
      return 'NOT_FOUND';
    }

    const target = await prisma.users.findUnique({
      where: { userId: data.targetUserId },
      select: UserEmailSelector,
    });

    if (!target) {
      return 'NOT_FOUND';
    }

    const project = await getProjectByIdService(projectId);

    if (project === 'INTERNAL_ERROR' || project === 'NOT_FOUND') {
      return project;
    }

    const email: EmailInput = {
      invitee: invitee as UserEmail,
      targetUser: target as UserEmail,
      subject: `Invitation to join ${project.title}`,
      textBody: `
                Hello ${target.firstName},
                \n\n
                You've been invited to join the project "${project.title}" as a ${role.label} by ${invitee.firstName} ${invitee.lastName}. 
                If you don't want to join the project or believe this is a mistake, you may safely ignore this email.
                \n\n
                Best,
                \n
                Looking For Group Team`,
      HTMLBody: '',
    };

    await sendEmail(email);

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
