import type { ProjectTag, TagCategory, TagType } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectTagSelector } from '#services/selectors/projects/parts/project-tag.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectTag } from '#services/transformers/projects/parts/project-tag.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/projects/{id}/tags
const getProjectTagsService = async (
  projectId: number,
): Promise<ProjectTag[] | GetServiceError> => {
  try {
    const project = await prisma.projects.findUnique({
      where: { projectId },
      include: {
        tags: {
          select: ProjectTagSelector,
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });

    if (project === null) {
      return 'NOT_FOUND';
    }

    //Swagger docs say the order of the tags is user-defined, so it will not be alphabetized
    return project.tags.map((tag) =>
      transformProjectTag(projectId, {
        label: tag.tag.label,
        tagId: tag.tagId,
        type: tag.tag.type as TagType,
        category: tag.tag.category as TagCategory,
        displayOrder: tag.displayOrder,
      }),
    );
  } catch (e) {
    console.error(`Error in getProjectTagsService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectTagsService;
