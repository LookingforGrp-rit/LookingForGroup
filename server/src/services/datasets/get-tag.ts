import { Tag } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetTagServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const getTagService = async (tagId: number): Promise<Tag | GetTagServiceError> => {
  try {
    const result = await prisma.tags.findFirst({
      where: { tagId },
      select: {
        tagId: true,
        label: true,
        type: true,
        category: true,
      },
    });

    if (!result) {
      return 'NOT_FOUND';
    }

    return result as Tag;
  } catch (e) {
    console.error('There was an internal error in getTagService: ', e);
    return 'INTERNAL_ERROR';
  }
};

export default getTagService;
