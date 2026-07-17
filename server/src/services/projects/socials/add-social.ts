import type { ProjectSocial, AddProjectSocialInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectSocialSelector } from '#services/selectors/projects/parts/project-social.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectSocial } from '#services/transformers/projects/parts/project-social.ts';

type AddProjectSocialServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

//POST api/projects/{id}/socials
export const addProjectSocialService = async (
  data: AddProjectSocialInput,
  projectId: number,
): Promise<ProjectSocial | AddProjectSocialServiceError> => {
  try {
    //websiteId validation
    const socialExists = await prisma.socials.findFirst({
      where: {
        websiteId: data.websiteId,
      },
    });

    if (!socialExists) return 'NOT_FOUND';

    const social = await prisma.projectSocials.create({
      data: {
        projectId: projectId,
        websiteId: data.websiteId,
        url: data.url,
        alias: data.alias,
      },
      select: ProjectSocialSelector,
    });

    return transformProjectSocial(projectId, social);
  } catch (error) {
    console.error('Error in addProjectSocialService:', error);
    return 'INTERNAL_ERROR';
  }
};
