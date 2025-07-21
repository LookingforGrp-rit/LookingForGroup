import prisma from '#config/prisma.ts';
import type { Users } from '#prisma-models/index.js';
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
    | 'jobTitleId'
    | 'majorId'
    | 'academicYear'
    | 'location'
    | 'funFact'
    | 'bio'
  >
>;

export const updateUserInfoService = async (
  userId: number,
  updates: UpdatebleUserFields,
): Promise<UpdatebleUserFields | UpdateUserServiceError> => {
  try {
    const user = await prisma.users.update({
      where: { userId },
      data: { ...updates },
      select: {
        firstName: true,
        lastName: true,
        headline: true,
        pronouns: true,
        jobTitleId: true,
        majorId: true,
        academicYear: true,
        location: true,
        funFact: true,
        bio: true,
      },
    });

    return user;
  } catch (e) {
    console.error('Error in updateUserInfoService:', e);
    return 'INTERNAL_ERROR';
  }
};
