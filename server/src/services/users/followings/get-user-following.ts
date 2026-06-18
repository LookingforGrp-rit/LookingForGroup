import type { UserFollowsList } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserPreviewSelector } from '#services/selectors/users/user-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';

type GetUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//get the users that a specific user is following
export const getUserFollowingService = async (
  senderId: number,
): Promise<UserFollowsList | GetUserServiceError> => {
  try {
    let userFollowings = await prisma.userFollowings.findMany({
      where: { senderId },
      orderBy: {
        followedAt: 'desc',
      },
      select: {
        receiverUser: {
          select: UserPreviewSelector,
        },
        followedAt: true,
      },
    });

    //Sorts array alphabetically by first name
    userFollowings = userFollowings.toSorted(
      (userFollowing1, userFollowing2) =>
        userFollowing1.receiverUser.firstName.charCodeAt(0) -
        userFollowing2.receiverUser.firstName.charCodeAt(0),
    );

    //For when the prefferedName column gets implemented in the database
    // userFollowings = userFollowings.toSorted((userFollowing1, userFollowing2) =>
    //   userFollowing1.receiverUser.preferredName.charCodeAt(0) - userFollowing2.receiverUser.preferredName.charCodeAt(0));

    const followings: UserFollowsList = {
      count: userFollowings.length,
      users: userFollowings.map(({ followedAt, receiverUser }) => ({
        followedAt,
        user: transformUserToPreview(receiverUser),
      })),
      apiUrl: `/api/users/${senderId.toString()}/followings/people`,
    };

    return followings;
  } catch (e) {
    console.error(`Error in getUserFollowingService: ${e as Error}`);
    return 'INTERNAL_ERROR';
  }
};
