import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteProjectSocialServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteProjectServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

export const deleteProjectSocialService = async (
  socialId: number,
  userId: number,
): Promise<DeleteProjectServiceSuccess | DeleteProjectSocialServiceError> => {
  try {
    //social validation (do you have this social)
    const socialExists = await prisma.projectSocials.findFirst({
      where: {
        websiteId: socialId,
        projectId: userId,
      },
    });

    if (!socialExists) return 'NOT_FOUND';

    await prisma.userSocials.delete({
      where: {
        userId_websiteId: {
          websiteId: socialId,
          userId: userId,
        },
      },
    });

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteProjectSocialService:', error);
    return 'INTERNAL_ERROR';
  }
};
