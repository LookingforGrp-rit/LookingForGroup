import type { Tag, EditTagInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type EditTagServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

export const editTagService = async (input: EditTagInput): Promise<Tag | EditTagServiceError> => {
  try {
    const tagResult = await prisma.tags.findFirst({
      where: {
        tagId: input.tagId,
      },
      select: {
        label: true,
        type: true,
        category: true,
      },
    });

    if (!tagResult) {
      return 'NOT_FOUND';
    }

    const result = await prisma.tags.update({
      where: {
        tagId: input.tagId,
      },
      data: {
        label: input.label ?? tagResult.label,
        type: input.type ?? tagResult.type,
        category: input.category ?? tagResult.category,
      },
    });

    return result as Tag;
  } catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'P2002') {
      return 'CONFLICT';
    }

    console.error('There was an error in EditTagService: ', e);
    return 'INTERNAL_ERROR';
  }
};
