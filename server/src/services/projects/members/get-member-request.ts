import type { MemberRequests } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

// GET api/projects/members/requests/{requestId}
const getMemberRequestService = async (
  requestId: number,
): Promise<MemberRequests | GetServiceError> => {
  try {
    const members = await prisma.memberRequests.findUnique({
      where: {
        requestId,
        sentFromProject: true,
      },
    });

    if (!members) {
      return 'NOT_FOUND';
    }

    return members;
  } catch (e) {
    console.error(`Error in getMemberRequestService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getMemberRequestService;
