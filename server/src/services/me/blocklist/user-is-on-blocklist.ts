import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type UserIsOnBlocklistServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

export const userIsOnBlocklistService = async (
  userId: number,
  blockerId: number,
): Promise<boolean | UserIsOnBlocklistServiceError> => {
  try {
    const result = await prisma.blocklist.findFirst({
      where: {
        blockerId,
        blockedId: userId,
      },
    });

    if (result) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.error('There was an error in userIsOnBlocklistService', e);
    return 'INTERNAL_ERROR';
  }
};
