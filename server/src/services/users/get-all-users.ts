import type { AcademicYear, UserDetail, UserFilters } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UsersAcademicYear } from '#prisma-models/index.js';
import { UserDetailSelector } from '#services/selectors/users/user-detail.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformUserToDetail } from '../transformers/users/user-detail.ts';

type GetUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'BAD_REQUEST'>;

export const getAllUsersService = async (
  filters: UserFilters,
): Promise<UserDetail[] | GetUserServiceError> => {
  try {
    if (Object.keys(filters).length !== 0) {
      const parsedFilters = [] as object[];

      Object.entries(filters).forEach((pair) => {
        let objectPair = {};
        if (pair[0] === 'mentor' || pair[0] === 'designer' || pair[0] === 'developer') {
          pair[1] = parseInt(pair[1] as string);
          objectPair = Object.fromEntries([pair]);
        }
        if (pair[0] === 'userSkills') {
          const skills = filters.skills?.split(',').map((skill) => parseInt(skill));
          if (skills?.includes(NaN)) return 'BAD_REQUEST'; //if it failed to parse because you didn't give me a number
          objectPair = {
            userSkills: {
              every: {
                skillId: {
                  in: skills,
                },
              },
            },
          };
        }
        if (pair[0] === 'academicYear') {
          const years = filters.academicYear?.split(',');
          years?.forEach((year) => {
            if (!Object.values(UsersAcademicYear).includes(year as AcademicYear))
              return 'BAD_REQUEST';
          });
          objectPair = {
            academicYear: {
              in: years,
            },
          };
        }
        if (pair[0] === 'majors') {
          const majors = filters.majors?.split(',').map((major) => parseInt(major));
          if (majors?.includes(NaN)) return 'BAD_REQUEST';
          objectPair = {
            majors: {
              every: {
                majorId: {
                  in: majors,
                },
              },
            },
          };
        }
        if (pair[0] === 'socials') {
          const socials = filters.socials?.split(',').map((social) => parseInt(social));
          if (socials?.includes(NaN)) return 'BAD_REQUEST'; //if it failed to parse because you didn't give me a number
          objectPair = {
            socials: {
              every: {
                websiteId: {
                  in: socials,
                },
              },
            },
          };
        }
        parsedFilters.push(objectPair);
      });

      const filteredUsers = await prisma.users.findMany({
        where: { OR: parsedFilters },
        orderBy: { createdAt: 'desc' },
        select: UserDetailSelector,
      });

      const transformedUsers = filteredUsers.map(transformUserToDetail);
      return transformedUsers;
    }

    const users = await prisma.users.findMany({
      orderBy: { createdAt: 'desc' },
      select: UserDetailSelector,
    });

    //return the transformed users
    const transformedUsers = users.map(transformUserToDetail);
    return transformedUsers;
  } catch (error) {
    console.error('Error in getAllUsersService:', error);
    return 'INTERNAL_ERROR';
  }
};
