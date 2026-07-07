import type { UserAccessLevel } from '@looking-for-group/shared/types.d.ts';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/me/get-username
//get username by google id now
export const getUserByGoogleService = async (
  googleId: string,
): Promise<
  { username: string; userId: number; accessLevel: UserAccessLevel } | GetUserServiceError
> => {
  try {
    //findUnique
    const user = await prisma.users.findFirst({
      where: { googleId },
      select: {
        username: true,
        userId: true,
        accessLevel: 'User',
      },
    });

    if (!user) return 'NOT_FOUND';

    return {
      username: user.username,
      userId: user.userId,
      accessLevel: user.accessLevel,
    };
  } catch (e) {
    console.error(`Error in getUserByGoogleService: ${e as Error}`);
    return 'INTERNAL_ERROR';
  }
};
