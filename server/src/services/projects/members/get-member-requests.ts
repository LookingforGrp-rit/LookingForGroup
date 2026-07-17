import type { MemberRequests } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

// GET api/projects/{id}/members/requests
const getMemberRequestsService = async (
  projectId: number,
): Promise<MemberRequests[] | GetServiceError> => {
  try {
    const requests = await prisma.memberRequests.findMany({
      where: {
        projectId,
      },
    });

    // returns [] if no request exists

    return requests;
  } catch (e) {
    console.error(`Error in getMemberRequestsService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getMemberRequestsService;
