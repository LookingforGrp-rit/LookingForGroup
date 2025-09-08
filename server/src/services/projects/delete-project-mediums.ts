import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteMediumsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteMediumsServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

//the mediums (or their ids anyway)
type MediumInputs = {
  mediumIds?: number[];
};

//delete however many mediums
export const deleteMediumsService = async (
  projectId: number,
  mediumData: MediumInputs,
): Promise<DeleteMediumsServiceSuccess | DeleteMediumsServiceError> => {
  try {
    const data = mediumData.mediumIds;
    if (!data) return 'NOT_FOUND';

    for (let i = 0; i < data.length; i++) {
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
              mediumId: data[i],
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
