import type { AddProjectTagsInput, ProjectTag } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectTagSelector } from '#services/selectors/projects/parts/project-tag.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectTag } from '#services/transformers/projects/parts/project-tag.ts';

type AddTagsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

//POST api/projects/{id}/tags
//add a tag
const addTagsService = async (
  projectId: number,
  tag: AddProjectTagsInput,
): Promise<ProjectTag[] | AddTagsServiceError> => {
  try {
    const result = await prisma.projects.update({
      where: {
        projectId,
      },
      data: {
        tags: {
          connect: tag,
        },
      },
      include: {
        tags: {
          where: tag,
          select: ProjectTagSelector,
        },
      },
    });

    return result.tags.map((tag) => transformProjectTag(projectId, tag));
  } catch (e) {
    if (e instanceof Object && 'code' in e) {
      if (e.code === 'P2025') {
        return 'NOT_FOUND';
      }

      if (e.code === 'P2002') {
        return 'CONFLICT';
      }
    }

    console.error('Error in addTagsService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default addTagsService;
