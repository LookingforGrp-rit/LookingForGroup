import prisma from '#config/prisma.ts';
import type { UserSocials } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type DeleteProjectSocialServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const deleteProjectSocialService = async (
  socialId: number,
  userId: number,
): Promise<UserSocials | DeleteProjectSocialServiceError> => {
  try {
    //social validation (do you have this social)
    const socialExists = await prisma.projectSocials.findFirst({
      where: {
        websiteId: socialId,
        projectId: userId,
      },
    });

    if (!socialExists) return 'NOT_FOUND';

    const social = await prisma.userSocials.delete({
      where: {
        userId_websiteId: {
          websiteId: socialId,
          userId: userId,
        },
      },
    });

    return social;
  } catch (error) {
    console.error('Error in deleteProjectSocialService:', error);
    return 'INTERNAL_ERROR';
  }
};
