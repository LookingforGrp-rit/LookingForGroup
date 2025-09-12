import type { Medium } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetMediumsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const getMediumsService = async (): Promise<Medium[] | GetMediumsServiceError> => {
  try {
    return await prisma.mediums.findMany({
      select: {
        mediumId: true,
        label: true,
      },
    });
  } catch (e) {
    console.error(`Error in getMediumsService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getMediumsService;
