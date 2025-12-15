import type { Medium } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MediumSelector } from '#services/selectors/datasets/medium.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMedium } from '#services/transformers/datasets/medium.ts';

type GetMediumsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

//GET api/datasets/mediums
const getMediumsService = async (): Promise<Medium[] | GetMediumsServiceError> => {
  try {
    const mediums = await prisma.mediums.findMany({
      select: MediumSelector,
      orderBy: {
        label: 'asc',
      },
    });

    return mediums.map(transformMedium);
  } catch (e) {
    console.error(`Error in getMediumsService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getMediumsService;
