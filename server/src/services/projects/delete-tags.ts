import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteTagServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteTagServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

//delete a tag
export const deleteTagsService = async (
  projectId: number,
  tagId: number,
): Promise<DeleteTagServiceSuccess | DeleteTagServiceError> => {
  try {
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
            tagId: tagId,
          },
        },
      },
    });

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
