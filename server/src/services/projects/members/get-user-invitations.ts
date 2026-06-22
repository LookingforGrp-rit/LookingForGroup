import type { MemberRequests } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/projects/{id}/members/applications
const getInvitationsService = async (
  prospectiveMemberId: number,
): Promise<MemberRequests[] | GetServiceError> => {
  try {
    const members = await prisma.memberRequests.findMany({
      where: {
        prospectiveMemberId,
        sentFromProject: true,
      },
      orderBy: {
        requestId: 'asc',
      },
    });

    if (members.length === 0) {
      return 'NOT_FOUND';
    }

    return members;
  } catch (e) {
    console.error(`Error in getInvitationsService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getInvitationsService;
