import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/me/get-username
//get username by shibboleth id
//this probably won't be used
//we have some code for implementing shibboleth but we weren't allowed to use it
//and we were working on an alternative for user sign in
export const getUserByShibService = async (
  universityId: string,
): Promise<{ username: string; userId: number } | GetUserServiceError> => {
  try {
    //findUnique
    const user = await prisma.users.findFirst({
      where: { universityId },
      select: {
        username: true,
        userId: true,
      },
    });

    if (!user) return 'NOT_FOUND';

    return user;
  } catch (e) {
    console.error(`Error in getUserByShibService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
