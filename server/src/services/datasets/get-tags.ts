import prisma from '#config/prisma.ts';
import { TagSelector } from '#services/selectors/datasets/tag.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformTag } from '#services/transformers/datasets/tag.ts';
import type { Tag } from '../../../../shared/types.ts';

type GetTagsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

//GET api/datasets/tags
const getTagsService = async (): Promise<Tag[] | GetTagsServiceError> => {
  try {
    let tags = await prisma.tags.findMany({
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

    //Array is now sorted alphabetically by label
    tags = tags.toSorted((tag1, tag2) => tag1.label.charCodeAt(0) - tag2.label.charCodeAt(0));
    return tags.map(transformTag);
  } catch (e) {
    console.error(`Error in getTagsService: ${e as Error}`);
    return 'INTERNAL_ERROR';
  }
};

export default getTagsService;
