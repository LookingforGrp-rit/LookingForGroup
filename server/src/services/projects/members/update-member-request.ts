import type { UpdateMemberRequestInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';
import addMemberService from './add-member.ts';

type DeleteServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'FORBIDDEN'>;
type DeleteServiceSuccess = ServiceSuccessSubset<'OK'>;

//PATCH api/projects/members/requests/{requestId}
const updateMemberRequestStatusService = async (
  requestId: number,
  userId: number,
  update: UpdateMemberRequestInput,
): Promise<DeleteServiceSuccess | DeleteServiceError> => {
  try {
    const request = await prisma.memberRequests.findUnique({
      where: {
        requestId,
      },
    });

    if (request === null) {
      return 'NOT_FOUND';
    }

    const ownerId = await prisma.projects.findFirst({
      where: {
        projectId: request.projectId,
      },
      select: {
        userId: true,
      },
    });

    if (ownerId === null) {
      return 'INTERNAL_ERROR';
    }

    // Check credentials for invitations: allow the invited user to respond,
    // and also allow the project owner to update the requested role.
    if (request.sentFromProject) {
      const isInvitedUser = userId === request.prospectiveMemberId;
      const isProjectOwner = userId === ownerId.userId;

      if (!isInvitedUser && !(isProjectOwner && update.roleId !== undefined)) {
        return 'FORBIDDEN';
      }
    }

    //Check credentials (for applications)
    if (!request.sentFromProject && userId !== ownerId.userId) {
      return 'FORBIDDEN';
    }

    await prisma.memberRequests.update({
      where: {
        requestId,
      },
      data: update,
    });

    //add member if accepted
    if (update.requestStatus === 'Accepted') {
      await addMemberService(request.projectId, {
        prospectiveMemberId: request.prospectiveMemberId,
        ownerUserId: ownerId.userId,
        roleId: request.roleId,
      });
    }

    return 'OK';
  } catch (e) {
    console.error(`Error in updateMemberRequestStatusService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default updateMemberRequestStatusService;
