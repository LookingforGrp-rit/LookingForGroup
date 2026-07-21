import type { Tag, UpdateTagBlacklistInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformTag } from '#services/transformers/datasets/tag.ts';
import getTagBlacklistService from './get-tag-blacklist.ts';

type UpdateTagBlacklistServiceError = ServiceErrorSubset<
  'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'
>;

//PATCH api/me/tag-blacklist
//Update a user's blacklisted tags
const updateTagBlacklistService = async (
  userId: number,
  data: UpdateTagBlacklistInput,
): Promise<Tag[] | UpdateTagBlacklistServiceError> => {
  //honestly i really want to just have this batch-update
  //yeah batch update gaming it'll be the only route that batch updates like this
  try {
    const tagBlacklist = await getTagBlacklistService(userId);

    if (tagBlacklist === 'INTERNAL_ERROR' || tagBlacklist === 'NOT_FOUND') {
      return tagBlacklist;
    }

    //transform each tag into a prisma-friendly input object

    const prismaFriendlyTagBlacklist = data.tagBlacklist.map((t) => {
      return {
        tagId: t.tagId,
        label_type: {
          label: t.label,
          type: t.type,
        },
        category: t.category,
      };
    });

    //and then just replace the entire blacklist with the new one because we're lazy like that
    //this needs testing bc i'm not all that familiar with prisma so idk if set is the right thing to use to completely replace it
    //so i gotta add it into swagger, buuuuuuut i'm now noticing that i would need to add the full ass tag into the swagger which is quite annoying
    //eh we'll manage
    const result = await prisma.users.update({
      where: { userId },
      include: {
        tagBlacklist: true,
      },
      data: {
        tagBlacklist: {
          set: prismaFriendlyTagBlacklist,
        },
      },
    });

    return result.tagBlacklist.map((t) => transformTag(t));
  } catch (e) {
    if (e instanceof Object && 'code' in e) {
      if (e.code === 'P2025') {
        return 'NOT_FOUND';
      }

      if (e.code === 'P2002') {
        return 'CONFLICT';
      }
    }

    console.error('Error in updateTagBlacklistService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default updateTagBlacklistService;
