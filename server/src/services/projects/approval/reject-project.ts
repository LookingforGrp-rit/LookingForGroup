import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type rejectProjectServiceError = ServiceErrorSubset<'NOT_FOUND' | 'INTERNAL_ERROR'>;
type rejectProjectServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

//DELETE /api/projects/unapproved/:id
export const rejectProjectService = async (
  projectId: number,
): Promise<rejectProjectServiceError | rejectProjectServiceSuccess> => {
  try {
    await prisma.projectsAwaitingApproval.delete({
      where: {
        projectId,
      },
    });

    return 'NO_CONTENT';
  } catch (e) {
    console.error('Error in rejectProjectService: ', e);

    if (!(e instanceof Object && 'code' in e)) {
      return 'INTERNAL_ERROR';
    }

    if (e.code === 'P2025') {
      return 'NOT_FOUND';
    }

    return 'INTERNAL_ERROR';
  }
};
