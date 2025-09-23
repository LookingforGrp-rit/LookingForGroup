import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteFollowServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'FORBIDDEN'>;
type DeleteFollowServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

//delete a member
export const deleteMemberService = async (
  projectId: number,
  memberId: number,
  curUser: number,
): Promise<DeleteFollowServiceError | DeleteFollowServiceSuccess> => {
  try {
    //is this member you?
    const member = await prisma.members.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: curUser,
        },
      },
    });

    //do you own this project?
    const owner = await prisma.projects.findUnique({
      where: {
        projectId,
        userId: curUser,
      },
    });

    //if you are neither of these things you cannot delete this member
    if (!member && !owner) return 'FORBIDDEN';

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
