import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteFollowServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;
type DeleteFollowServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

//DELETE api/me/followings/projects/{id}
//delete a project following
export const deleteProjectFollowService = async (
  userId: number,
  projectId: number,
): Promise<DeleteFollowServiceError | DeleteFollowServiceSuccess> => {
  try {
    //delete the project being followed
    await prisma.projectFollowings.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteProjectFollowService:', error);
    return 'INTERNAL_ERROR';
  }
};
