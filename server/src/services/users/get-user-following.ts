import type { UserPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserPreviewSelector } from '#services/selectors/users/user-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';

type GetUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//get the user by the username
export const getUserFollowingService = async (
  senderId: number,
): Promise<UserPreview[] | GetUserServiceError> => {
  try {
    const following = await prisma.userFollowings.findMany({
      where: { senderId },
      orderBy: {
        followedAt: 'desc',
      },
      select: {
        receiverUser: {
          select: UserPreviewSelector,
        },
      },
    });

    if (following.length === 0) {
      return 'NOT_FOUND';
    }

    return following.map(({ receiverUser }) => transformUserToPreview(receiverUser));
  } catch (e) {
    console.error(`Error in getUserFollowingService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
