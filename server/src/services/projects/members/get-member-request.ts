import type { MemberRequests, GetMemberRequest } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

// GET api/projects/members/requests
const getMemberRequestService = async (
  data: GetMemberRequest,
): Promise<MemberRequests | GetServiceError> => {
  try {
    const where: {
      requestId?: number;
      prospectiveMemberId?: number;
      projectId?: number;
      roleId?: number;
    } = {};

    if (data.requestId !== undefined) {
      where.requestId = data.requestId;
    }

    if (data.prospectiveMemberId !== undefined) {
      where.prospectiveMemberId = data.prospectiveMemberId;
    }

    if (data.projectId !== undefined) {
      where.projectId = data.projectId;
    }

    if (data.roleId !== undefined) {
      where.roleId = data.roleId;
    }

    const request = await prisma.memberRequests.findFirst({ where });

    if (!request) {
      return 'NOT_FOUND';
    }

    return request;
  } catch (e) {
    console.error(`Error in getMemberRequestService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getMemberRequestService;
