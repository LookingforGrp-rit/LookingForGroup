import type { UserDetail, UserFilters } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserDetailSelector } from '#services/selectors/users/user-detail.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformUserToDetail } from '../transformers/users/user-detail.ts';

type GetUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

export const getAllUsersService = async (
  filters: UserFilters,
  restriction: 'any' | 'all',
): Promise<UserDetail[] | GetUserServiceError> => {
  try {
    if (Object.keys(filters).length !== 0) {
      const parsedFilters = [] as object[];

      if (filters.mentor !== undefined) {
        parsedFilters.push({ mentor: filters.mentor });
      }
      if (filters.designer !== undefined) {
        parsedFilters.push({
          userSkills: {
            ...(filters.designer
              ? {
                  some: {
                    skills: {
                      type: 'Designer',
                    },
                  },
                }
              : {
                  none: {
                    skills: {
                      type: 'Designer',
                    },
                  },
                }),
          },
        });
      }
      //a little dry... but it works
      if (filters.developer !== undefined) {
        parsedFilters.push({
          userSkills: {
            ...(filters.developer
              ? {
                  some: {
                    skills: {
                      type: 'Developer',
                    },
                  },
                }
              : {
                  none: {
                    skills: {
                      type: 'Developer',
                    },
                  },
                }),
          },
        });
      }
      if (filters.skills !== undefined) {
        parsedFilters.push({
          userSkills: {
            every: {
              skillId: {
                in: filters.skills,
              },
            },
          },
        });
      }
      if (filters.academicYear !== undefined) {
        parsedFilters.push({
          academicYear: {
            in: filters.academicYear,
          },
        });
      }
      if (filters.majors !== undefined) {
        parsedFilters.push({
          majors: {
            every: {
              majorId: {
                in: filters.majors,
              },
            },
          },
        });
      }
      if (filters.socials !== undefined) {
        parsedFilters.push({
          userSocials: {
            every: {
              websiteId: {
                in: filters.socials,
              },
            },
          },
        });
      }

      //any/all toggle, param given as query
      let restrictionObject = {};
      if (restriction === 'any') {
        restrictionObject = { OR: parsedFilters };
      }
      if (restriction === 'all') {
        restrictionObject = { AND: parsedFilters };
      }

      const filteredUsers = await prisma.users.findMany({
        where: restrictionObject,
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
