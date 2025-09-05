import type { MePrivate } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { Users } from '#prisma-models/index.js';
import { deleteImageService } from '#services/images/delete-image.ts';
import { MePrivateSelector } from '#services/selectors/me/me-private.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMeToPrivate } from '#services/transformers/me/me-private.ts';

type UpdateUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

// updatable fields only
type UpdatebleUserFields = Partial<
  Pick<
    Users,
    | 'firstName'
    | 'lastName'
    | 'headline'
    | 'pronouns'
    | 'title'
    | 'academicYear'
    | 'location'
    | 'funFact'
    | 'bio'
    | 'visibility'
    | 'username'
    | 'phoneNumber'
    | 'profileImage'
  >
>;

export const updateUserInfoService = async (
  userId: number,
  updates: UpdatebleUserFields,
): Promise<MePrivate | UpdateUserServiceError> => {
  try {
    const curUser = await prisma.users.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!curUser) return 'NOT_FOUND';

    if (curUser.profileImage !== null) {
      const currentPfp = curUser.profileImage;
      await deleteImageService(currentPfp);
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
