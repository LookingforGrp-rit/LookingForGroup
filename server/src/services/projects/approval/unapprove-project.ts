import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type UnapproveProjectServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type ChangeProjectApprovalServiceSuccess = ServiceSuccessSusbet<'OK'>;

//PATCH api/projects/unapprove/:id
export const unapproveProjectService = async (
  projectId: number,
): Promise<UnapproveProjectServiceError | ChangeProjectApprovalServiceSuccess> => {
  try {
    await prisma.projectsAwaitingApproval.update({
      where: { projectId },
      data: { approved: false },
    });

    return 'OK';
  } catch (e) {
    console.error(`Error changeProjectApprovalService:`, e);
    return 'INTERNAL_ERROR';
  }
};
