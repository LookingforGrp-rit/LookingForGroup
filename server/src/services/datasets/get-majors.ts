import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';
import type { Major } from '../../../../shared/types.ts';

type GeMajorsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const getMajorsService = async (): Promise<Major[] | GeMajorsServiceError> => {
  try {
    return await prisma.majors.findMany({
      select: {
        majorId: true,
        label: true,
      },
    });
  } catch (e) {
    console.error(`Error in getMajorsService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getMajorsService;
