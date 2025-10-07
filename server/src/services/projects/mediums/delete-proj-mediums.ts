import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteMediumsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteMediumsServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

//delete a medium
export const deleteMediumsService = async (
  projectId: number,
  mediumId: number,
): Promise<DeleteMediumsServiceSuccess | DeleteMediumsServiceError> => {
  try {
    await prisma.projects.update({
      where: {
        projectId: projectId,
      },
      select: {
        mediums: true,
      },
      data: {
        mediums: {
          disconnect: {
            mediumId,
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
