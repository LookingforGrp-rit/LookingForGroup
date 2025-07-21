import type { UserPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type GetUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//get user by username
export const getUserByUsernameService = async (
  username: string,
): Promise<UserPreview | GetUserServiceError> => {
  try {
    //should be unique
    const user = await prisma.users.findFirst({
      where: { username },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        username: true,
        profileImage: true,
      },
    });

    if (!user) return 'NOT_FOUND';

    return user;
  } catch (e) {
    console.error(`Error in getUserByUsernameService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
