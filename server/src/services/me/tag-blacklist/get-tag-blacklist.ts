import type { Tag } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { TagSelector } from '#services/selectors/datasets/tag.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformTag } from '#services/transformers/datasets/tag.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/me/tag-blacklist
//Get a user's blacklisted tags
const getTagBlacklistService = async (userId: number): Promise<Tag[] | GetServiceError> => {
  try {
    //we take the blacklist
    const tags = await prisma.users.findUnique({
      where: {
        userId,
      },
      include: {
        tagBlacklist: {
          select: TagSelector,
        },
      },
    });

    if (tags === null) {
      return 'NOT_FOUND';
    }

    //and we transform them into tags
    //this should be fine right
    return tags.tagBlacklist.map((tag) =>
      transformTag({
        label: tag.label,
        tagId: tag.tagId,
        type: tag.type,
        category: tag.category,
      }),
    );
  } catch (e) {
    console.error(`Error in getTagBlacklistService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getTagBlacklistService;
