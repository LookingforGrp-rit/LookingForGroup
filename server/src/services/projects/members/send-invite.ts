import type { SendProjectInviteInput } from '@looking-for-group/shared';
// import prisma from '#config/prisma.ts';
// import { ProjectMemberSelector } from '#services/selectors/projects/parts/project-member.ts';
import getRolesService from '#services/datasets/get-roles.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type SendInviteServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;
type SendInviteServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

//POST api/projects/{id}/members/invite
//sends an invite to a user to join a project
const sendInviteService = async (
  projectId: number,
  data: SendProjectInviteInput,
): Promise<SendInviteServiceSuccess | SendInviteServiceError> => {
  console.log('Received invite request for project ID:', projectId);
  console.log('Invite data:', data);

  await getRolesService();

  return 'NOT_FOUND';
};

export default sendInviteService;
