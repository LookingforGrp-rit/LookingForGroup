import type { MySocial, AddUserSocialInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MySocialSelector } from '#services/selectors/me/parts/my-social.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMySocial } from '#services/transformers/me/parts/my-social.ts';

type AddSocialServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//POST api/me/socials
export const addSocialService = async (
  data: AddUserSocialInput,
  userId: number,
): Promise<MySocial | AddSocialServiceError> => {
  try {
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
