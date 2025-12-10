import type { MyFollowing } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserPreviewSelector } from '#services/selectors/users/user-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';

type AddFollowServiceError = ServiceErrorSubset<
  'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT' | 'FORBIDDEN'
>;

//POST api/me/followings/people/{id}
export const addUserFollowingService = async (
  senderId: number,
  receiverId: number,
): Promise<MyFollowing | AddFollowServiceError> => {
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
      select: {
        followedAt: true,
        receiverUser: {
          select: UserPreviewSelector,
        },
      },
    });

    const result: MyFollowing = {
      followedAt: addFollow.followedAt,
      user: transformUserToPreview(addFollow.receiverUser),
      apiUrl: `/api/me/followings/people/${receiverId.toString()}`,
    };

    return result;
  } catch (error) {
    console.error('Error in addUserFollowingService:', error);
    return 'INTERNAL_ERROR';
  }
};
