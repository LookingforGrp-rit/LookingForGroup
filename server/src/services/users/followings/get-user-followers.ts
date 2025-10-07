import type { UserFollowsList } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserPreviewSelector } from '#services/selectors/users/user-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';

type GetUserFollowerServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//get the users that follow a specific user
export const getUserFollowersService = async (
  receiverId: number,
): Promise<UserFollowsList | GetUserFollowerServiceError> => {
  try {
    const userFollowings = await prisma.userFollowings.findMany({
      where: { receiverId: receiverId },
      orderBy: {
        followedAt: 'desc',
      },
      select: {
        senderUser: {
          select: UserPreviewSelector,
        },
        followedAt: true,
      },
    });

    const followings: UserFollowsList = {
      count: userFollowings.length,
      users: userFollowings.map(({ followedAt, senderUser }) => ({
        followedAt,
        user: transformUserToPreview(senderUser),
      })),
      apiUrl: `/api/users/${receiverId.toString()}/followers`,
    };

    return followings;
  } catch (e) {
    console.error(`Error in getUserFollowersService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
