import type { Member } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type DeleteFollowServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//delete a user following
export const deleteMemberService = async (
  projectId: number,
  memberId: number,
): Promise<Member | DeleteFollowServiceError> => {
  try {
    //delete the user being followed
    const deleteMember = await prisma.members.delete({
      where: {
        projectId_userId: {
          projectId: projectId,
          userId: memberId,
        },
      },
    });

    return deleteMember;
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
