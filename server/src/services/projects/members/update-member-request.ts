import type { MemberRequestStatus } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';
import addMemberService from './add-member.ts';

type DeleteServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'FORBIDDEN'>;
type DeleteServiceSuccess = ServiceSuccessSubset<'OK'>;

//PATCH api/projects/members/requests/{requestId}
const updateMemberRequestStatusService = async (
  requestId: number,
  userId: number,
  newStatus: MemberRequestStatus,
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

    //Check credentials (for invitations)
    if (request.sentFromProject && userId !== request.prospectiveMemberId) {
      return 'FORBIDDEN';
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

    //Check credentials (for applications)
    if (!request.sentFromProject && userId !== ownerId.userId) {
      return 'FORBIDDEN';
    }

    await prisma.memberRequests.update({
      where: {
        requestId,
      },
      data: {
        requestStatus: newStatus,
      },
    });

    //add member if accepted
    if (newStatus === 'Accepted') {
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
