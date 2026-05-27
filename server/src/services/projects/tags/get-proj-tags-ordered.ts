import type { ProjectTag } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import getTagsService from '#services/projects/tags/get-proj-tags.ts';
import { ProjectTagOrderSelector } from '#services/selectors/projects/parts/project-tag-order.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectTag } from '#services/transformers/projects/parts/project-tag.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/projects/{id}/tags/ordered
const getProjectTagsOrderedService = async (
  projectId: number,
): Promise<ProjectTag[] | GetServiceError> => {
  try {
    const project = await prisma.projects.findUnique({
      where: { projectId },
      include: {
        tagOrder: {
          select: ProjectTagOrderSelector,
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });

    if (project === null) {
      return 'NOT_FOUND';
    }

    const tags = await getTagsService(projectId);

    if (tags === 'INTERNAL_ERROR' || tags === 'NOT_FOUND') {
      return tags;
    }

    const orderMap = new Map(
      project.tagOrder.map(({ tagId, displayOrder }) => [tagId, displayOrder]),
    );

    tags.sort(
      (a, b) =>
        (orderMap.get(a.tagId) ?? Number.MAX_SAFE_INTEGER) -
        (orderMap.get(b.tagId) ?? Number.MAX_SAFE_INTEGER),
    );

    return tags.map((tag) => transformProjectTag(projectId, tag));
  } catch (e) {
    console.error(`Error in getProjectTagsOrderedService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectTagsOrderedService;
