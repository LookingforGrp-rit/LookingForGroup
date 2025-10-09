import type { ProjectSocial } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectSocialSelector } from '#services/selectors/projects/parts/project-social.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectSocial } from '#services/transformers/projects/parts/project-social.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const getProjectSocialsService = async (
  projectId: number,
): Promise<ProjectSocial[] | GetServiceError> => {
  try {
    const project = await prisma.projects.findUnique({
      where: { projectId },
      include: {
        projectSocials: {
          select: ProjectSocialSelector,
          orderBy: {
            socials: {
              label: 'asc',
            },
          },
        },
      },
    });

    if (project === null) {
      return 'NOT_FOUND';
    }

    return project.projectSocials.map((social) => transformProjectSocial(projectId, social));
  } catch (e) {
    console.error(`Error in getProjectSocialsService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectSocialsService;
