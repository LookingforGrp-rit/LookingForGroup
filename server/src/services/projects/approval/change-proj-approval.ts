import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type ChangeProjectApprovalServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type ChangeProjectApprovalServiceSuccess = ServiceSuccessSusbet<'OK'>;

//PATCH api/projects/approve/:id    (when approved = true)
//PATCH api/projects/unapprove/:id  (when approved = false)
export const changeProjectApprovalService = async (
  projectId: number,
  approved: boolean,
): Promise<ChangeProjectApprovalServiceError | ChangeProjectApprovalServiceSuccess> => {
  try {
    await prisma.projects.update({
      where: { projectId },
      data: { approved },
    });

    // only removing project on the awaiting approvals table IF the project is actually awaiting approval.
    if (approved) {
      await prisma.projectsAwaitingApproval.delete({
        where: {
          projectId,
        },
      });
    }

    return 'OK';
  } catch (e) {
    console.error(`Error changeProjectApprovalService:`, e);
    return 'INTERNAL_ERROR';
  }
};
