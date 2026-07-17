import type { UserDetail } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserDetailSelector } from '#services/selectors/users/user-detail.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformUserToDetail } from '../../transformers/users/user-detail.ts';

type GetUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/users/search-google/{id}
export const getUserByGoogleIdService = async (
  googleId: string,
): Promise<UserDetail | GetUserServiceError> => {
  try {
    const user = await prisma.users.findUnique({
      where: { googleId },
      select: UserDetailSelector,
    });

    //if user doesnt exist
    if (!user) return 'NOT_FOUND';

    //return the transformed user
    return transformUserToDetail(user);
  } catch (e) {
    console.error('Error in getUserByGoogleIdService:', e);
    return 'INTERNAL_ERROR';
  }
};
