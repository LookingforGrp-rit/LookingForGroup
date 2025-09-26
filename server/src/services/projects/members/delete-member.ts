import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteMemberServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteMemberServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

//delete a member
export const deleteMemberService = async (
  projectId: number,
  memberId: number,
): Promise<DeleteMemberServiceError | DeleteMemberServiceSuccess> => {
  try {
    // Prevent project owners from being deleted through this route
    const project = await prisma.projects.findUnique({
      where: { projectId },
      select: { userId: true },
    });

    if (!project) {
      return 'NOT_FOUND';
    }

    if (project.userId === memberId) {
      return 'NOT_FOUND'; // Return NOT_FOUND to avoid revealing project ownership structure
    }

    await prisma.members.delete({
      where: {
        projectId_userId: {
          projectId: projectId,
          userId: memberId,
        },
      },
    });

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteMemberService:', error);

    if (error instanceof Object && 'code' in error) {
      if (error.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }

    return 'INTERNAL_ERROR';
  }
};
