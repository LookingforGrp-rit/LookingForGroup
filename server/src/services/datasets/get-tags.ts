import prisma from '#config/prisma.ts';
import { TagSelector } from '#services/selectors/datasets/tag.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformTag } from '#services/transformers/datasets/tag.ts';
import type { Tag } from '../../../../shared/types.ts';

type GetTagsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const getTagsService = async (): Promise<Tag[] | GetTagsServiceError> => {
  try {
    const tags = await prisma.tags.findMany({
      select: TagSelector,
      orderBy: [
        {
          type: 'asc',
        },
        {
          label: 'asc',
        },
      ],
    });

    return tags.map(transformTag);
  } catch (e) {
    console.error(`Error in getTagsService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getTagsService;
