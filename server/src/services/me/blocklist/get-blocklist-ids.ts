import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetBlocklistServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

export const getBlocklistIdsService = async (
  userId: number,
): Promise<number[] | GetBlocklistServiceError> => {
  try {
    const result = await prisma.blocklist.findMany({
      where: {
        blockerId: userId,
      },
      select: {
        blockedId: true,
      },
    });

    return result.map((value: { blockedId: number }): number => {
      return value.blockedId;
    });
  } catch (e) {
    console.error('There was an error in getBlocklistService: ', e);
    return 'INTERNAL_ERROR';
  }
};
