import type { SendProjectInviteInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import getRolesService from '#services/datasets/get-roles.ts';
import { UserEmailSelector } from '#services/selectors/users/parts/user-email.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';
import getProjectByIdService from '../get-proj-id.ts';

type RequestToJoinServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type RequestToJoinServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

//
export const requestToJoinService = async (
  projectId: number,
  data: SendProjectInviteInput,
): Promise<RequestToJoinServiceSuccess | RequestToJoinServiceError> => {
  try {
    // grabbing the requested role
    const roles = await getRolesService();

    if (roles === 'INTERNAL_ERROR') {
      return roles;
    }

    const role = roles.find((r) => r.roleId === data.roleId);

    if (!role) {
      return 'NOT_FOUND';
    }

    // grabbing the requester
    const requester = await prisma.users.findUnique({
      where: { userId: data.prospectiveMemberId },
      select: UserEmailSelector,
    });

    if (!requester) {
      return 'NOT_FOUND';
    }

    // grabbing the project owner
    const owner = await prisma.users.findUnique({
      where: { userId: data.ownerUserId },
      select: UserEmailSelector,
    });

    if (!owner) {
      return 'NOT_FOUND';
    }

    // grabbing the project
    const project = await getProjectByIdService(projectId);

    if (project === 'NOT_FOUND' || project === 'INTERNAL_ERROR') {
      return project;
    }

    // Setting up the email
    //const msg = data.message.length === 0 ? 'No message included.' : data.message;

    //const clientUrl = process.env.CLIENT_URL ?? 'localhost';

    // place in endpoint for accepting a request.
    //const acceptUrl = `${clientUrl}/projects/${String(projectId)}/members/`

    // Send message here

    return 'NO_CONTENT';
  } catch (e) {
    console.error(`There was an error in requestToJoinService: `, e);
    return 'INTERNAL_ERROR';
  }
};
