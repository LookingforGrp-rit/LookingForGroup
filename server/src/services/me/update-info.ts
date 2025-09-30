import type { MePrivate, UpdateUserInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { deleteImageService } from '#services/images/delete-image.ts';
import { MePrivateSelector } from '#services/selectors/me/me-private.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMeToPrivate } from '#services/transformers/me/me-private.ts';

type UpdateUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

// updatable fields only
type UpdateUserServiceParameters = Partial<
  Omit<UpdateUserInput, 'profileImage' | 'mentor'> & { profileImage: string; mentor: 0 | 1 }
>;

export const updateUserInfoService = async (
  userId: number,
  updates: UpdateUserServiceParameters,
): Promise<MePrivate | UpdateUserServiceError> => {
  try {
    const curUser = await prisma.users.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!curUser) return 'NOT_FOUND';

    if (updates.profileImage) {
      const oldProfileImage = curUser.profileImage;
      if (oldProfileImage !== null) {
        await deleteImageService(oldProfileImage);
      }
    }

    const user = await prisma.users.update({
      where: { userId },
      data: { ...updates },
      select: MePrivateSelector,
    });

    return transformMeToPrivate(user);
  } catch (e) {
    console.error('Error in updateUserInfoService:', e);
    return 'INTERNAL_ERROR';
  }
};
