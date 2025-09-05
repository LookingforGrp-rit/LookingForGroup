import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//get username by shibboleth id
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
