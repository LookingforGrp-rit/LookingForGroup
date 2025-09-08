import type { ProjectTag } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectTagSelector } from '#services/selectors/projects/parts/project-tag.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectTag } from '#services/transformers/projects/parts/project-tag.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const getProjectTagsService = async (
  projectId: number,
): Promise<ProjectTag[] | GetServiceError> => {
  try {
    const project = await prisma.projects.findUnique({
      where: { projectId },
      include: {
        tags: {
          select: ProjectTagSelector,
        },
      },
    });

    if (project === null) {
      return 'NOT_FOUND';
    }

    return project.tags.map((tag) => transformProjectTag(projectId, tag));
  } catch (e) {
    console.error(`Error in getProjectTagsService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectTagsService;
