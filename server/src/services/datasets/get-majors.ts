import prisma from '#config/prisma.ts';
import { MajorSelector } from '#services/selectors/datasets/major.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMajor } from '#services/transformers/datasets/major.ts';
import type { Major } from '../../../../shared/types.ts';

type GetMajorsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

//GET api/datasets/majors
const getMajorsService = async (): Promise<Major[] | GetMajorsServiceError> => {
  try {
    let majors = await prisma.majors.findMany({
      select: MajorSelector,

      orderBy: {
        label: 'asc',
      },
    });
    //Array is ordered alphabetically by label
    majors = majors.toSorted(
      (major1, major2) => major1.label.charCodeAt(0) - major2.label.charCodeAt(0),
    );
    return majors.map(transformMajor);
  } catch (e) {
    console.error(`Error in getMajorsService: ${e as Error}`);
    return 'INTERNAL_ERROR';
  }
};

export default getMajorsService;
