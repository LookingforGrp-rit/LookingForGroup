import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'FORBIDDEN'>;
type DeleteServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

//DELETE api/projects/members/requests/{requestId}
const deleteMemberRequestService = async (
  requestId: number,
  userId: number,
): Promise<DeleteServiceSuccess | GetServiceError> => {
  try {
    const request = await prisma.memberRequests.findUnique({
      where: {
        requestId,
      },
    });

    if (request === null) {
      return 'NOT_FOUND';
    }

    //Check credentials (for applications)
    if (!request.sentFromProject && userId !== request.prospectiveMemberId) {
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

    //Check credentials (for invitations)
    if (request.sentFromProject && userId !== ownerId.userId) {
      return 'FORBIDDEN';
    }

    await prisma.memberRequests.delete({
      where: {
        requestId,
      },
    });

    return 'NO_CONTENT';
  } catch (e) {
    console.error(`Error in deleteMemberRequestService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default deleteMemberRequestService;
