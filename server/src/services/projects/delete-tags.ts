import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type DeleteTagServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

type Tag = {
  tags: {
    tagId: number;
    label: string;
    type: string;
  }[];
};

//delete a member
export const deleteTagsService = async (
  projectId: number,
  tagId: number,
): Promise<Tag | DeleteTagServiceError> => {
  try {
    const deleteTag = await prisma.projects.update({
      where: {
        projectId: projectId,
      },
      select: {
        tags: true,
      },
      data: {
        tags: {
          disconnect: {
            tagId: tagId,
          },
        },
      },
    });

    return deleteTag;
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
