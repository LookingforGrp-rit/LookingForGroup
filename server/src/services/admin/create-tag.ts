import { CreateTagInput, Tag } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ServiceErrorSubset } from '#services/service-outcomes.ts';

type CreateTagServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

export const createTagService = async (
  input: CreateTagInput,
): Promise<Tag | CreateTagServiceError> => {
  try {
    const result = await prisma.tags.create({
      data: {
        label: input.label,
        type: input.type,
        category: input.category,
      },
    });

    return result as Tag;
  } catch (e) {
    console.error('There was an internal error in createTagService: ', e);
    return 'INTERNAL_ERROR';
  }
};
