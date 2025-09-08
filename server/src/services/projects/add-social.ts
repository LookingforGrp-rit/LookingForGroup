import type { ProjectSocial } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectSocialSelector } from '#services/selectors/projects/parts/project-social.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectSocial } from '#services/transformers/projects/parts/project-social.ts';

type SocialInput = {
  socialId: number;
  url: string;
};

type AddProjectSocialServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const addProjectSocialService = async (
  data: SocialInput,
  projectId: number,
): Promise<ProjectSocial | AddProjectSocialServiceError> => {
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
      select: ProjectSocialSelector,
    });

    return transformProjectSocial(projectId, social);
  } catch (error) {
    console.error('Error in addProjectSocialService:', error);
    return 'INTERNAL_ERROR';
  }
};
