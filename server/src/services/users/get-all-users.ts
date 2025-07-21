import type { UserDetail } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';
import { transformUser } from '../helpers/userTransform.ts';

type GetUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const getAllUsersService = async (): Promise<UserDetail[] | GetUserServiceError> => {
  try {
    const users = await prisma.users.findMany({
      where: { visibility: 1 },
      orderBy: { createdAt: 'desc' },
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

    //return the transformed users
    const transformedUsers = users.map(transformUser);
    return transformedUsers;
  } catch (error) {
    console.error('Error in getAllUsersService:', error);
    return 'INTERNAL_ERROR';
  }
};
