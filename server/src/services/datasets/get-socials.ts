import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';
import type { Social } from '../../../../shared/types.ts';

type GetSocialsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const getSocialsService = async (): Promise<Social[] | GetSocialsServiceError> => {
  try {
    return await prisma.socials.findMany({
      select: {
        websiteId: true,
        label: true,
      },
    });
  } catch (e) {
    console.error(`Error in getSocialsService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getSocialsService;
