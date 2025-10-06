import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteTagsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteTagsServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

//delete however many tags
export const deleteTagsService = async (
  projectId: number,
  tag: number,
): Promise<DeleteTagsServiceSuccess | DeleteTagsServiceError> => {
  try {
    await prisma.projects.update({
      where: {
        projectId,
      },
      select: {
        tags: true,
      },
      data: {
        tags: {
          disconnect: {
            tagId: tag,
          },
        },
      },
    });

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteMediumsService:', error);

    if (error instanceof Object && 'code' in error) {
      if (error.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }

    return 'INTERNAL_ERROR';
  }
};
