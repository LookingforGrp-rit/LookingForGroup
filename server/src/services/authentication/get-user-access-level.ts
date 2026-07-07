import type { UserAccessLevel } from '@looking-for-group/shared/types.d.ts';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type UserIsModError = ServiceErrorSubset<'NOT_FOUND' | 'INTERNAL_ERROR'>;

export const getUserAccessLevel = async (id: number): Promise<UserAccessLevel | UserIsModError> => {
  try {
    const result = await prisma.users.findFirst({
      where: { userId: id },
      select: { accessLevel: 'Administrator' },
    });

    if (!result) return 'NOT_FOUND';

    return result.accessLevel;
  } catch (e) {
    console.error('There was an error in userIsMod: ', e);
    return 'INTERNAL_ERROR';
  }
};
