import type { MySocial } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MySocialSelector } from '#services/selectors/me/parts/my-social.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMySocial } from '#services/transformers/me/parts/my-social.ts';

type SocialUpdateInput = {
  websiteId: number;
  url: string;
};

type UpdateSocialServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const updateSocialService = async (
  data: SocialUpdateInput,
  userId: number,
): Promise<MySocial | UpdateSocialServiceError> => {
  try {
    //social validation (do you have this social)
    const socialExists = await prisma.userSocials.findFirst({
      where: {
        websiteId: data.websiteId,
        userId: userId,
      },
    });
    if (!socialExists) return 'NOT_FOUND';

    const social = await prisma.userSocials.update({
      where: {
        userId_websiteId: {
          userId: userId,
          websiteId: data.websiteId,
        },
      },
      data: {
        url: data.url,
      },
      select: MySocialSelector,
    });

    return transformMySocial(social);
  } catch (error) {
    console.error('Error in updateSocialService:', error);
    return 'INTERNAL_ERROR';
  }
};
