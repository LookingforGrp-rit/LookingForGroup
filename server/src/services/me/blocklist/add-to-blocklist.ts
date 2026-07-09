import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type AddToBlocklistServiceError = ServiceErrorSubset<'CONFLICT' | 'INTERNAL_ERROR'>;
type AddToBlocklistServiceSuccess = ServiceSuccessSubset<'OK'>;

export const addToBlocklistService = async (
  blockerId: number,
  blockedId: number,
): Promise<AddToBlocklistServiceError | AddToBlocklistServiceSuccess> => {
  try {
    const preBlockData = await prisma.blocklist.findFirst({
      where: {
        blockerId,
        blockedId,
      },
    });

    if (preBlockData) {
      return 'CONFLICT';
    }

    await prisma.blocklist.create({
      data: {
        blockerId,
        blockedId,
      },
    });

    return 'OK';
  } catch (e) {
    console.error('There was an error in addToBlocklistService: ', e);
    return 'INTERNAL_ERROR';
  }
};
