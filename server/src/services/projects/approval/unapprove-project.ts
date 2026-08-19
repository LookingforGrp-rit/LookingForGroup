import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type UnapproveProjectServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type ChangeProjectApprovalServiceSuccess = ServiceSuccessSubset<'OK'>;

//PATCH api/projects/unapprove/:id
export const unapproveProjectService = async (
  projectId: number,
): Promise<UnapproveProjectServiceError | ChangeProjectApprovalServiceSuccess> => {
  try {
    await prisma.projects.update({
      where: { projectId },
      data: {
        approved: false,
      },
    });

    return 'OK';
  } catch (e) {
    console.error(`Error unapproveProjectService:`, e);
    return 'INTERNAL_ERROR';
  }
};
