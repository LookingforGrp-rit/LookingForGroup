import prisma from '#config/prisma.ts';
import { MajorSelector } from '#services/selectors/datasets/major.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMajor } from '#services/transformers/datasets/major.ts';
import type { Major } from '../../../../shared/types.ts';

type GetMajorsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const getMajorsService = async (): Promise<Major[] | GetMajorsServiceError> => {
  try {
    const majors = await prisma.majors.findMany({
      select: MajorSelector,
      orderBy: {
        label: 'asc',
      },
    });

    return majors.map(transformMajor);
  } catch (e) {
    console.error(`Error in getMajorsService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getMajorsService;
