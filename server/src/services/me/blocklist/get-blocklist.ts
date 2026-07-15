import type { UserPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserPreviewSelector } from '#services/selectors/users/user-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformBlocklistToPreview } from '#services/transformers/users/user-preview.ts';

type GetBlocklistServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

export const getBlocklistService = async (
  userId: number,
): Promise<UserPreview[] | GetBlocklistServiceError> => {
  try {
    const result = await prisma.blocklist.findMany({
      where: {
        blockerId: userId,
      },
      select: {
        blocked: {
          select: UserPreviewSelector,
        },
      },
    });

    return result.map(transformBlocklistToPreview);
  } catch (e) {
    console.error('There was an error in getBlocklistService: ', e);
    return 'INTERNAL_ERROR';
  }
};
