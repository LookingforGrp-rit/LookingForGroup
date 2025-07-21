import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';
import type { Genre } from '../../../../shared/types.ts';

type GetGenresServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const getGenreService = async (): Promise<Genre[] | GetGenresServiceError> => {
  try {
    return await prisma.genres.findMany({
      select: {
        typeId: true,
        label: true,
      },
    });
  } catch (e) {
    console.error(`Error in getGenreService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getGenreService;
