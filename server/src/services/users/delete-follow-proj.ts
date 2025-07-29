import type { ProjectFollowings } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type DeleteFollowServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

//delete a project following
export const deleteProjectFollowService = async (
  userId: number,
  projectId: number,
): Promise<ProjectFollowings | DeleteFollowServiceError> => {
  try {
    //delete the project being followed
    const deleteFollow = await prisma.projectFollowings.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    return deleteFollow;
  } catch (error) {
    console.error('Error in deleteProjectFollowService:', error);
    return 'INTERNAL_ERROR';
  }
};
