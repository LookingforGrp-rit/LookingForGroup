import prisma from '#config/prisma.ts';
import type { Users } from '#prisma-models/index.js';
import { deleteImageService } from '#services/images/delete-image.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

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
    | 'majorId'
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
): Promise<UpdatebleUserFields | UpdateUserServiceError> => {
  try {
    const curUser = await prisma.users.findFirst({
      where: {
        userId: userId,
      },
    });

    if (curUser && curUser.profileImage !== null) {
      const currentPfp = curUser.profileImage;
      await deleteImageService(currentPfp);
    }

    const user = await prisma.users.update({
      where: { userId },
      data: { ...updates },
      select: {
        username: true,
        firstName: true,
        lastName: true,
        headline: true,
        pronouns: true,
        title: true,
        majorId: true,
        academicYear: true,
        location: true,
        funFact: true,
        bio: true,
        visibility: true,
        phoneNumber: true,
        profileImage: true,
      },
    });

    return user;
  } catch (e) {
    console.error('Error in updateUserInfoService:', e);
    return 'INTERNAL_ERROR';
  }
};
