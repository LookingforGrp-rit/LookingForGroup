import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type ApproveProjectServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type ApproveProjectServiceSuccess = ServiceSuccessSubset<'OK'>;

//PATCH api/projects/approve/:id
export const approveProjectService = async (
  projectId: number,
): Promise<ApproveProjectServiceError | ApproveProjectServiceSuccess> => {
  try {
    // Will throw an exception if project is not on list of projects awaiting approval.
    await prisma.projectsAwaitingApproval.delete({
      where: {
        projectId,
      },
    });

    await prisma.projects.update({
      where: {
        projectId,
      },
      data: {
        approved: true,
      },
    });
    return 'OK';
  } catch (e) {
    console.error(`Error approveProjectService:`, e);

    if (!(e instanceof Object && 'code' in e)) {
      return 'INTERNAL_ERROR';
    }

    if (e.code === 'P2025') {
      return 'NOT_FOUND';
    }

    return 'INTERNAL_ERROR';
  }
};
