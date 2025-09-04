import type { Medium } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type GetGenresServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const getGenreService = async (): Promise<Medium[] | GetGenresServiceError> => {
  try {
    return await prisma.mediums.findMany({
      select: {
        mediumId: true,
        label: true,
      },
    });
  } catch (e) {
    console.error(`Error in getGenreService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getGenreService;
