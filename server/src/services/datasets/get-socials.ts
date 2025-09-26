import prisma from '#config/prisma.ts';
import { SocialSelector } from '#services/selectors/datasets/social.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformSocial } from '#services/transformers/datasets/social.ts';
import type { Social } from '../../../../shared/types.ts';

type GetSocialsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const getSocialsService = async (): Promise<Social[] | GetSocialsServiceError> => {
  try {
    const socials = await prisma.socials.findMany({
      select: SocialSelector,
    });

    return socials.map(transformSocial);
  } catch (e) {
    console.error(`Error in getSocialsService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getSocialsService;
