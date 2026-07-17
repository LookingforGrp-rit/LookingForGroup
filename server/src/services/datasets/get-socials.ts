import prisma from '#config/prisma.ts';
import { SocialSelector } from '#services/selectors/datasets/social.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformSocial } from '#services/transformers/datasets/social.ts';
import type { Social } from '../../../../shared/types.ts';

type GetSocialsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

//GET api/datasets/socials
const getSocialsService = async (): Promise<Social[] | GetSocialsServiceError> => {
  try {
    let socials = await prisma.socials.findMany({
      select: SocialSelector,

      orderBy: {
        label: 'asc',
      },
    });

    //Should sort the array alphabetically
    socials = socials.toSorted(
      (social1, social2) => social1.label.charCodeAt(0) - social2.label.charCodeAt(0),
    );
    return socials.map(transformSocial);
  } catch (e) {
    console.error(`Error in getSocialsService: ${e as Error}`);
    return 'INTERNAL_ERROR';
  }
};

export default getSocialsService;
