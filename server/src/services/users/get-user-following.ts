import type { UserFollowings } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type GetUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//get the user by the username
export const getUserFollowingService = async (
  userId: number,
): Promise<UserFollowings[] | GetUserServiceError> => {
  try {
    const following = await prisma.userFollowings.findMany({
      where: { userId },
      select: {
        userId: true,
        followingId: true,
        followedAt: true,
      },
    });

    if (following.length === 0) {
      return 'NOT_FOUND';
    }

    return following;
  } catch (e) {
    console.error(`Error in getUserFollowingService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
