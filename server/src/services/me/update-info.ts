import type { MePrivate } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { Users } from '#prisma-models/index.js';
import { deleteImageService } from '#services/images/delete-image.ts';
import { uploadImageService } from '#services/images/upload-image.ts';
import { MePrivateSelector } from '#services/selectors/me/me-private.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMeToPrivate } from '#services/transformers/me/me-private.ts';

type UpdateUserServiceError = ServiceErrorSubset<
  'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONTENT_TOO_LARGE'
>;

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
  >
> & { profileImage?: Express.Multer.File };

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

    let newProfileImage = undefined;

    if (updates.profileImage) {
      const oldProfileImage = curUser.profileImage;

      const result = await uploadImageService(
        updates.profileImage.buffer,
        updates.profileImage.originalname,
        updates.profileImage.mimetype,
      );
      if (result === 'INTERNAL_ERROR') return 'INTERNAL_ERROR';
      if (result === 'CONTENT_TOO_LARGE') return 'CONTENT_TOO_LARGE';

      newProfileImage = result.location;

      if (oldProfileImage !== null) {
        await deleteImageService(oldProfileImage);
      }
    }

    const databaseUpdates: Omit<UpdatebleUserFields, 'profileImage'> = updates;

    const user = await prisma.users.update({
      where: { userId },
      data: {
        ...databaseUpdates,
        ...(newProfileImage ? { profileImage: newProfileImage } : {}),
      },
      select: MePrivateSelector,
    });

    return transformMeToPrivate(user);
  } catch (e) {
    console.error('Error in updateUserInfoService:', e);
    return 'INTERNAL_ERROR';
  }
};
