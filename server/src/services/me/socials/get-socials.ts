import type { MySocial } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MySocialSelector } from '#services/selectors/me/parts/my-social.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMySocial } from '#services/transformers/me/parts/my-social.ts';

type GetSocialsError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/me/socials
export const getSocialsService = async (userId: number): Promise<MySocial[] | GetSocialsError> => {
  try {
    //all their socials
    let socials = await prisma.userSocials.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        socials: {
          label: 'asc',
        },
      },
      select: MySocialSelector,
    });

    //Array is sorted alphabetically by website label
    socials = socials.toSorted(
      (social1, social2) =>
        social1.socials.label.charCodeAt(0) - social2.socials.label.charCodeAt(0),
    );
    return socials.map(transformMySocial);
  } catch (e) {
    console.error(`Error in getSocialsService: ${e as Error}`);
    return 'INTERNAL_ERROR';
  }
};
