//POST api/projects/unapproved

import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type RequestApprovalServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;
type RequestApprovalServiceSuccess = ServiceSuccessSubset<'CREATED'>;

//POST api/projects/unapproved/:id
export const requestApprovalService = async (
  projectId: number,
): Promise<RequestApprovalServiceError | RequestApprovalServiceSuccess> => {
  try {
    // if the project is already awaiting approval...
    if (await prisma.projectsAwaitingApproval.findFirst({ where: { projectId } })) {
      return 'CONFLICT';
    }

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
