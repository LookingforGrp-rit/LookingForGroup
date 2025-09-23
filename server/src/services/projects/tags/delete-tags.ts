import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteTagsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteTagsServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

//the tags (or their ids anyway)
type TagInputs = {
  tagIds?: number[];
};

//delete however many tags
export const deleteTagsService = async (
  projectId: number,
  tagData: TagInputs,
): Promise<DeleteTagsServiceSuccess | DeleteTagsServiceError> => {
  try {
    const data = tagData.tagIds;
    if (!data) return 'NOT_FOUND';

    for (let i = 0; i < data.length; i++) {
      await prisma.projects.update({
        where: {
          projectId: projectId,
        },
        select: {
          tags: true,
        },
        data: {
          tags: {
            disconnect: {
              tagId: data[i],
            },
          },
        },
      });
    }
    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteTagsService:', error);

    if (error instanceof Object && 'code' in error) {
      if (error.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }

    return 'INTERNAL_ERROR';
  }
};
