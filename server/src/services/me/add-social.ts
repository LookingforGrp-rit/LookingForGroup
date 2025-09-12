import type { MySocial } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MySocialSelector } from '#services/selectors/me/parts/my-social.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMySocial } from '#services/transformers/me/parts/my-social.ts';

type SocialCreateInput = {
  websiteId: number;
  url: string;
};

type AddSocialServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const addSocialService = async (
  data: SocialCreateInput,
  userId: number,
): Promise<MySocial | AddSocialServiceError> => {
  try {
    //websiteId validation
    const socialExists = await prisma.socials.findFirst({
      where: {
        websiteId: data.websiteId,
      },
    });

    if (!socialExists) return 'NOT_FOUND';

    const social = await prisma.userSocials.create({
      data: {
        userId: userId,
        websiteId: data.websiteId,
        url: data.url,
      },
      select: MySocialSelector,
    });

    const result = transformMySocial(social);

    return result;
  } catch (error) {
    console.error('Error in addSocialService:', error);
    return 'INTERNAL_ERROR';
  }
};
