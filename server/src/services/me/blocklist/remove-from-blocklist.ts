import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type RemoveFromBlocklistServiceError = ServiceErrorSubset<'CONFLICT' | 'INTERNAL_ERROR'>;
type RemoveFromBlocklistServiceSuccess = ServiceSuccessSubset<'OK'>;

export const removeFromBlocklistService = async (
  blockerId: number,
  blockedId: number,
): Promise<RemoveFromBlocklistServiceError | RemoveFromBlocklistServiceSuccess> => {
  try {
    const blockData = await prisma.blocklist.findFirst({
      where: {
        blockerId,
        blockedId,
      },
      select: {
        blockId: true,
      },
    });

    if (!blockData) {
      return 'CONFLICT';
    }

    await prisma.blocklist.delete({
      where: {
        blockId: blockData.blockId,
      },
    });

    return 'OK';
  } catch (e) {
    console.error('There was an error in addToBlocklistService: ', e);
    return 'INTERNAL_ERROR';
  }
};
