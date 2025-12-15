import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteSocialServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteSocialServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

//DELETE api/me/socials/{websiteId}
export const deleteSocialService = async (
  websiteId: number,
  userId: number,
): Promise<DeleteSocialServiceError | DeleteSocialServiceSuccess> => {
  try {
    await prisma.userSocials.delete({
      where: {
        userId_websiteId: {
          websiteId: websiteId,
          userId: userId,
        },
      },
    });

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteSocialService:', error);
    return 'INTERNAL_ERROR';
  }
};
