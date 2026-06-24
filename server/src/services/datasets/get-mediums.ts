import type { Medium } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MediumSelector } from '#services/selectors/datasets/medium.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMedium } from '#services/transformers/datasets/medium.ts';

type GetMediumsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

//GET api/datasets/mediums
const getMediumsService = async (): Promise<Medium[] | GetMediumsServiceError> => {
  try {
    let mediums = await prisma.mediums.findMany({
      select: MediumSelector,

      orderBy: {
        label: 'asc',
      },
    });

    //Should sort the array alphabetically
    mediums = mediums.toSorted(
      (medium1, medium2) => medium1.label.charCodeAt(0) - medium2.label.charCodeAt(0),
    );
    return mediums.map(transformMedium);
  } catch (e) {
    console.error(`Error in getMediumsService: ${e as Error}`);
    return 'INTERNAL_ERROR';
  }
};

export default getMediumsService;
