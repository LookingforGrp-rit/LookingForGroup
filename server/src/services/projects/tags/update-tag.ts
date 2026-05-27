import type { UpdateProjectTagInput, ProjectTag } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import getProjectTags from '#services/projects/tags/get-proj-tags.ts';
import { ProjectTagSelector } from '#services/selectors/projects/parts/project-tag.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectTag } from '#services/transformers/projects/parts/project-tag.ts';

type UpdateTagServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

// PUT api/projects/{id}/tags
// update a tag
const updateTagService = async (
  projectId: number,
  tag: UpdateProjectTagInput,
): Promise<ProjectTag[] | UpdateTagServiceError> => {
  try {
    const tags = await getProjectTags(projectId);

    if (tags === 'INTERNAL_ERROR' || tags === 'NOT_FOUND') {
      return tags;
    }

    // check if tag to be updated exists
    const existingIndex = tags.findIndex((t) => t.tagId === tag.tagId);

    if (existingIndex === -1) {
      return 'NOT_FOUND';
    }

    // update the tag's display order
    await prisma.projectTags.update({
      where: {
        projectId_tagId: {
          projectId,
          tagId: tag.tagId as number,
        },
      },
      data: {
        displayOrder: tag.displayOrder,
      },
      select: ProjectTagSelector,
    });

    // remove tag from current position
    const [movedTag] = tags.splice(existingIndex, 1);

    // insert at new position
    const targetIndex = (tag.displayOrder as number) - 1;

    tags.splice(targetIndex, 0, movedTag);

    // renumber all tags
    for (const [index, t] of tags.entries()) {
      if (t.displayOrder !== index + 1) {
        // update display order in db if it doesn't match the new order
        t.displayOrder = index + 1;
        await prisma.projectTags.update({
          where: {
            projectId_tagId: {
              projectId,
              tagId: t.tagId,
            },
          },
          data: {
            displayOrder: t.displayOrder,
          },
        });
      }
    }

    return tags.map((t) => transformProjectTag(projectId, t));
  } catch (e) {
    if (e instanceof Object && 'code' in e) {
      if (e.code === 'P2025') {
        return 'NOT_FOUND';
      }

      if (e.code === 'P2002') {
        return 'CONFLICT';
      }
    }

    console.error('Error in updateTagService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default updateTagService;
