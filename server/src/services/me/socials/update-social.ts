import type { MySocial, UpdateUserSocialInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MySocialSelector } from '#services/selectors/me/parts/my-social.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMySocial } from '#services/transformers/me/parts/my-social.ts';

type UpdateSocialServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//PATCH api/me/socials/{websiteId}
export const updateSocialService = async (
  data: UpdateUserSocialInput & { websiteId: number },
  userId: number,
): Promise<MySocial | UpdateSocialServiceError> => {
  try {
    const social = await prisma.userSocials.update({
      where: {
        userId_websiteId: {
          userId: userId,
          websiteId: data.websiteId,
        },
      },
      data: data.url ? { url: data.url } : {},
      select: MySocialSelector,
    });

    return transformMySocial(social);
  } catch (error) {
    console.error('Error in updateSocialService:', error);
    return 'INTERNAL_ERROR';
  }
};
