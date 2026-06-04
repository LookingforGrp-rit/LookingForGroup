import prisma from '#config/prisma.ts';
import type { PrismaClientKnownRequestError } from '#prisma-models/runtime/library.js';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type ApproveProjectServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type ApproveProjectServiceSuccess = ServiceSuccessSusbet<'OK'>;

//PATCH api/projects/approve/:id
export const approveProjectService = async (
  projectId: number,
): Promise<ApproveProjectServiceError | ApproveProjectServiceSuccess> => {
  try {
    // Will throw an exception if project is not on list of projects awaiting approval.
    await prisma.projectsAwaitingApproval.update({
      where: {
        projectId,
      },
      data: {
        approved: true,
      },
    });

    await prisma.projectsAwaitingApproval.delete({
      where: {
        projectId,
      },
    });
    return 'OK';
  } catch (e) {
    console.error(`Error changeProjectApprovalService:`, e);
    if ((e as PrismaClientKnownRequestError).code.toUpperCase() === 'P2025') {
      return 'NOT_FOUND';
    }
    return 'INTERNAL_ERROR';
  }
};
