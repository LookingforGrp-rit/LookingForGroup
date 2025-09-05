import prisma from '#config/prisma.ts';
import type { UserSocials } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetSocialsError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const getSocialsService = async (
  userId: number,
): Promise<UserSocials[] | GetSocialsError> => {
  try {
    //all their socials
    const socials = await prisma.userSocials.findMany({
      where: {
        userId: userId,
      },
    });

    return socials;
  } catch (e) {
    console.error(`Error in getSocialsService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
