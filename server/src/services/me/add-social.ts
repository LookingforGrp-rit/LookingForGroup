import prisma from '#config/prisma.ts';
import type { UserSocials } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type Social = {
  socialId: number;
  url: string;
};

type AddSocialServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const addSocialService = async (
  data: Social,
  userId: number,
): Promise<UserSocials | AddSocialServiceError> => {
  try {
    const socialExists = await prisma.socials.findFirst({
      where: {
        websiteId: data.socialId,
      },
    });

    if (!socialExists) return 'NOT_FOUND';

    const social = await prisma.userSocials.create({
      data: {
        userId: userId,
        websiteId: data.socialId,
        url: data.url,
      },
    });

    return social;
  } catch (error) {
    console.error('Error in addSocialService:', error);
    return 'INTERNAL_ERROR';
  }
};
