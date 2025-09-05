import prisma from '#config/prisma.ts';
import type { Users } from '#prisma-models/index.js';
import { deleteImageService } from '#services/images/delete-image.ts';
//import { MePrivateSelector } from '#services/selectors/me/me-private.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

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
    | 'profileImage'
    | 'academicYear'
    | 'location'
    | 'funFact'
    | 'bio'
    | 'visibility'
    | 'username'
    | 'phoneNumber'
  >
>;

export const updateUserInfoService = async (
  userId: number,
  updates: UpdatebleUserFields,
): Promise<UpdatebleUserFields | UpdateUserServiceError> => {
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
      data: {
        ...updates,
      },
    });

    return user;
  } catch (e) {
    console.error('Error in updateUserInfoService:', e);
    return 'INTERNAL_ERROR';
  }
};
