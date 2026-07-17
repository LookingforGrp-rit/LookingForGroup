import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetBlockerServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

export const getBlockerIdsByGidService = async (
  gid: string,
): Promise<number[] | GetBlockerServiceError> => {
  try {
    const result = await prisma.blocklist.findMany({
      where: {
        blocked: {
          googleId: gid,
        },
      },
      select: {
        blockerId: true,
      },
    });

    return result.map((value: { blockerId: number }): number => {
      return value.blockerId;
    });
  } catch (e) {
    console.error('There was an error in getBlocklistService: ', e);
    return 'INTERNAL_ERROR';
  }
};
