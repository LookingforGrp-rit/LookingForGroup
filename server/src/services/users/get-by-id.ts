import type { UserDetail } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';
import { transformUser } from '../helpers/userTransform.ts';

type GetUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//get user by id
export const getUserByIdService = async (
  userId: number,
): Promise<UserDetail | GetUserServiceError> => {
  try {
    const user = await prisma.users.findUnique({
      where: { userId },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        username: true,
        profileImage: true,
        headline: true,
        pronouns: true,
        academicYear: true,
        location: true,
        funFact: true,
        bio: true,
        jobTitles: {
          select: { label: true },
        },
        majors: {
          select: { label: true },
        },
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
      },
    });

    //if user doesnt exist
    if (!user) return 'NOT_FOUND';

    //return the transformed user
    return transformUser(user);
  } catch (e) {
    console.error('Error in getUserByIdService:', e);
    return 'INTERNAL_ERROR';
  }
};
