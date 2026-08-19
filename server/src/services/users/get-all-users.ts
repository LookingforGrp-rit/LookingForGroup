import type { FilterRequest, UserPreview, UserSortMethod } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserDetailSelector } from '#services/selectors/users/user-detail.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';

type GetUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

export const getAllUsersService = async (
  filters: FilterRequest,
  sortMethod: UserSortMethod,
): Promise<UserPreview[] | GetUserServiceError> => {
  try {
    const parsedFilters = [] as object[];

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
    if (filters.ritStatus !== undefined) {
      parsedFilters.push({
        ritStatus: {
          in: filters.ritStatus,
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
    if (filters.strictness === 'any') {
      restrictionObject = { OR: parsedFilters };
    }
    if (filters.strictness === 'all') {
      restrictionObject = { AND: parsedFilters };
    }

    let orderByInput;
    switch (sortMethod) {
      case 'Newest':
        orderByInput = { createdAt: 'desc' as const };
        break;
      case 'A-Z':
        orderByInput = { firstName: 'asc' as const };
        break;
    }

    const users = await prisma.users.findMany({
      where: {
        ...restrictionObject,
        privacy: 'public',
      },
      orderBy: orderByInput,
      select: UserDetailSelector,
    });

    const transformedUsers = users.map(transformUserToPreview);

    return transformedUsers;
  } catch (error) {
    console.error('Error in getAllUsersService:', error);
    return 'INTERNAL_ERROR';
  }
};
