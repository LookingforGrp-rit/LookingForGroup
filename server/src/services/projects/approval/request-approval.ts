//POST api/projects/unapproved

import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type RequestApprovalServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type RequestApprovalServiceSuccess = ServiceSuccessSusbet<'CREATED'>;

//POST api/projects/unapproved/:id
export const requestApprovalService = async (
  projectId: number,
): Promise<RequestApprovalServiceError | RequestApprovalServiceSuccess> => {
  try {
    await prisma.projectsAwaitingApproval.create({
      data: {
        projectId,
      },
    });

    return 'CREATED';
  } catch (e) {
    console.error('Error in requestApprovalService: ', e);
    return 'INTERNAL_ERROR';
  }
};
