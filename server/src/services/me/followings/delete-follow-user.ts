import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteFollowServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;
type DeleteFollowServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

//delete a user following
export const deleteUserFollowService = async (
  senderId: number,
  receiverId: number,
): Promise<DeleteFollowServiceError | DeleteFollowServiceSuccess> => {
  try {
    //delete the user being followed
    await prisma.userFollowings.delete({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
    });

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteUserFollowService:', error);

    if (error instanceof Object && 'code' in error) {
      if (error.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }

    return 'INTERNAL_ERROR';
  }
};
