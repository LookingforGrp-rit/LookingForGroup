import prisma from '#config/prisma.ts';
import type { ProjectSocials } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type Social = {
  socialId: number;
  url: string;
};

type AddProjectSocialServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const addProjectSocialService = async (
  data: Social,
  projectId: number,
): Promise<ProjectSocials | AddProjectSocialServiceError> => {
  try {
    //socialId validation
    const socialExists = await prisma.socials.findFirst({
      where: {
        websiteId: data.socialId,
      },
    });

    if (!socialExists) return 'NOT_FOUND';

    const social = await prisma.projectSocials.create({
      data: {
        projectId: projectId,
        websiteId: data.socialId,
        url: data.url,
      },
    });

    return social;
  } catch (error) {
    console.error('Error in addProjectSocialService:', error);
    return 'INTERNAL_ERROR';
  }
};
