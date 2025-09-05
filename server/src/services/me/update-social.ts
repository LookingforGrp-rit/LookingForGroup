import prisma from '#config/prisma.ts';
import type { UserSocials } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-error.ts';

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
    //socialId validation
    const socialExists = await prisma.socials.findFirst({
      where: {
        websiteId: data.socialId,
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
