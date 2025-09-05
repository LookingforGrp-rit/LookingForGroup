import type { UserFollowings } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetUserFollowerServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//get the user by the username
export const getUserFollowersService = async (
  receiverId: number,
): Promise<UserFollowings[] | GetUserFollowerServiceError> => {
  try {
    const following = await prisma.userFollowings.findMany({
      where: { receiverId: receiverId },
      orderBy: {
        followedAt: 'desc',
      },
      select: {
        senderId: true,
        receiverId: true,
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
