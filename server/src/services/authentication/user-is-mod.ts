import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type UserIsModError = ServiceErrorSubset<'NOT_FOUND' | 'INTERNAL_ERROR'>;

export const userIsMod = async (id: number): Promise<boolean | UserIsModError> => {
  try {
    const result = await prisma.users.findFirst({
      where: { userId: id },
      select: { moderator: true },
    });

    if (!result) return 'NOT_FOUND';

    return result.moderator;
  } catch (e) {
    console.error('There was an error in userIsMod: ', e);
    return 'INTERNAL_ERROR';
  }
};
