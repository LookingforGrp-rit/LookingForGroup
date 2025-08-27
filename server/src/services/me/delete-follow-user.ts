import type { UserFollowings } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type DeleteFollowServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

//delete a user following
export const deleteUserFollowService = async (
  userId: number,
  followingId: number,
): Promise<UserFollowings | DeleteFollowServiceError> => {
  try {
    //delete the user being followed
    const deleteFollow = await prisma.userFollowings.delete({
      where: {
        userId_followingId: {
          userId,
          followingId,
        },
      },
    });

    return deleteFollow;
  } catch (error) {
    console.error('Error in deleteUserFollowService:', error);
    return 'INTERNAL_ERROR';
  }
};
