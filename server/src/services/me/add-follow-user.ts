import type { UserFollowings } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type AddFollowServiceError = ServiceErrorSubset<
  'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT' | 'FORBIDDEN'
>;

export const addUserFollowingService = async (
  senderId: number,
  receiverId: number,
): Promise<UserFollowings | AddFollowServiceError> => {
  try {
    //no following self
    if (senderId === receiverId) return 'FORBIDDEN';

    //check if user exists
    const followUser = await prisma.users.findUnique({
      where: { userId: receiverId },
      select: { userId: true },
    });

    if (!followUser) return 'NOT_FOUND';

    //if already followed
    const exists = await prisma.userFollowings.findUnique({
      where: {
        senderId_receiverId: {
          senderId,
          receiverId,
        },
      },
    });

    if (exists) return 'CONFLICT';

    ///create the following
    const addFollow = await prisma.userFollowings.create({
      data: {
        senderId,
        receiverId,
      },
    });

    return addFollow;
  } catch (error) {
    console.error('Error in addUserFollowingService:', error);
    return 'INTERNAL_ERROR';
  }
};
