import prisma from '#config/prisma.ts';
import type { UserSocials } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type Social = {
  socialId: number;
  url: string;
};

type UpdateSocialServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const updateSocialService = async (
  data: Social,
  userId: number,
): Promise<UserSocials | UpdateSocialServiceError> => {
  try {
    //social validation (do you have this social)
    const socialExists = await prisma.userSocials.findFirst({
      where: {
        websiteId: data.socialId,
        userId: userId,
      },
    });
    if (!socialExists) return 'NOT_FOUND';

    const social = await prisma.userSocials.update({
      where: {
        userId_websiteId: {
          userId: userId,
          websiteId: data.socialId,
        },
      },
      data: {
        url: data.url,
      },
    });

    return social;
  } catch (error) {
    console.error('Error in addSocialService:', error);
    return 'INTERNAL_ERROR';
  }
};
