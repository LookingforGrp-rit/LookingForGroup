import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type ChangeProjectApprovalServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type ChangeProjectApprovalServiceSuccess = ServiceSuccessSusbet<'OK'>;

export const changeProjectApprovalService = async (
  projectId: number,
  approved: boolean,
): Promise<ChangeProjectApprovalServiceError | ChangeProjectApprovalServiceSuccess> => {
  try {
    await prisma.projects.update({
      where: { projectId },
      data: { approved },
    });

    return 'OK';
  } catch (e) {
    console.error(`Error changeProjectApprovalService:`, e);
    return 'INTERNAL_ERROR';
  }
};
