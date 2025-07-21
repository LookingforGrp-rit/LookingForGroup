import prisma from '#config/prisma.ts';
import type { Users } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type GetUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//can show sensitive data
export const getUserAccountService = async (
  userId: number,
): Promise<Users | GetUserServiceError> => {
  try {
    const user = await prisma.users.findUnique({
      where: { userId },
      select: {
        userId: true,
        username: true,
        ritEmail: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        headline: true,
        pronouns: true,
        jobTitleId: true,
        majorId: true,
        academicYear: true,
        location: true,
        funFact: true,
        bio: true,
        visibility: true,
        userSkills: {
          select: {
            position: true,
            skills: {
              select: {
                skillId: true,
                label: true,
                type: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
        userSocials: {
          select: {
            socials: {
              select: {
                websiteId: true,
                label: true,
              },
            },
          },
        },
        phoneNumber: true,
        universityId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user ?? 'NOT_FOUND';
  } catch (e) {
    console.error('Error in getUserByIdService:', e);
    return 'INTERNAL_ERROR';
  }
};
