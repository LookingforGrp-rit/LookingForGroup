import type { UserFollowings } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type AddFollowServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

export const addUserFollowingService = async (
  userId: number,
  followingId: number,
): Promise<UserFollowings | AddFollowServiceError> => {
  try {
    //no following self
    if (userId === followingId) return 'NOT_FOUND';

    //check if user exists
    const followUser = await prisma.users.findUnique({
      where: { userId: followingId },
      select: { userId: true },
    });

    if (!followUser) return 'NOT_FOUND';

    //if already followed
    const exists = await prisma.userFollowings.findUnique({
      where: {
        userId_followingId: {
          userId,
          followingId,
        },
      },
    });

    if (exists) return 'CONFLICT';

    ///create the following
    const addFollow = await prisma.userFollowings.create({
      data: {
        userId,
        followingId,
      },
    });

    return addFollow;
  } catch (error) {
    console.error('Error in addUserFollowingService:', error);
    return 'INTERNAL_ERROR';
  }
};
