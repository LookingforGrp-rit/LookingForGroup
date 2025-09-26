import type { UserDetail } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserDetailSelector } from '#services/selectors/users/user-detail.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformUserToDetail } from '../transformers/users/user-detail.ts';

type GetUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const getAllUsersService = async (): Promise<UserDetail[] | GetUserServiceError> => {
  try {
    const users = await prisma.users.findMany({
      //where: { visibility: 1 },
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
