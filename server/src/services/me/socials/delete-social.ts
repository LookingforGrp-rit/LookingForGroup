import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type DeleteSocialServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteSocialServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

//DELETE api/me/socials/{id}
export const deleteSocialService = async (
  id: number,
): Promise<DeleteSocialServiceError | DeleteSocialServiceSuccess> => {
  try {
    await prisma.userSocials.delete({
      where: {
        id: id,
      },
    });

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteSocialService:', error);

    if (error instanceof Object && 'code' in error) {
      if (error.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }

    return 'INTERNAL_ERROR';
  }
};
