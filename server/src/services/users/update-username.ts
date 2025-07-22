import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type UpdateUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const updateUserUsernameService = async (
  userId: number,
  username: string,
): Promise<{ username: string } | UpdateUserServiceError> => {
  try {
    const user = await prisma.users.update({
      where: { userId },
      data: { username },
      select: { username: true },
    });

    return { username: user.username };
  } catch (e) {
    console.error('Error in updateUserUsernameService:', e);
    return 'INTERNAL_ERROR';
  }
};
