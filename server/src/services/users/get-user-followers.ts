import type { UserPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserPreviewSelector } from '#services/selectors/users/user-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';

type GetUserFollowerServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//get the user by the username
export const getUserFollowersService = async (
  receiverId: number,
): Promise<UserPreview[] | GetUserFollowerServiceError> => {
  try {
    const following = await prisma.userFollowings.findMany({
      where: { receiverId: receiverId },
      select: {
        senderUser: {
          select: UserPreviewSelector,
        },
      },
    });

    if (following.length === 0) {
      return 'NOT_FOUND';
    }

    return following.map(({ senderUser }) => transformUserToPreview(senderUser));
  } catch (e) {
    console.error(`Error in getUserFollowingService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
