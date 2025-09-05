import type { MySocial } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MySocialSelector } from '#services/selectors/me/my-social.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMySocial } from '#services/transformers/me/my-social.ts';

type GetSocialsError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const getSocialsService = async (userId: number): Promise<MySocial[] | GetSocialsError> => {
  try {
    //all their socials
    const socials = await prisma.userSocials.findMany({
      where: {
        userId: userId,
      },
      select: MySocialSelector,
    });

    return socials.map(transformMySocial);
  } catch (e) {
    console.error(`Error in getSocialsService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
