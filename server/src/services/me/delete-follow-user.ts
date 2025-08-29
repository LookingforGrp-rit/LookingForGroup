import type { UserFollowings } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type DeleteFollowServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

//delete a user following
export const deleteUserFollowService = async (
  senderId: number,
  receiverId: number,
): Promise<UserFollowings | DeleteFollowServiceError> => {
  try {
    //delete the user being followed
    const deleteFollow = await prisma.userFollowings.delete({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
    });

    return deleteFollow;
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
