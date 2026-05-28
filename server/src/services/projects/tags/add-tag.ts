import type { AddProjectTagInput, ProjectTag, TagType } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectTagSelector } from '#services/selectors/projects/parts/project-tag.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectTag } from '#services/transformers/projects/parts/project-tag.ts';

type AddTagsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

//POST api/projects/{id}/tags
//add a tag
const addTagService = async (
  projectId: number,
  tag: AddProjectTagInput,
): Promise<ProjectTag | AddTagsServiceError> => {
  try {
    const newTag = await prisma.projectTags.create({
      data: {
        projectId,
        tagId: tag.tagId,
        displayOrder: tag.displayOrder,
      },
      select: ProjectTagSelector,
    });

    return transformProjectTag(projectId, {
      label: newTag.tag.label,
      tagId: newTag.tagId,
      type: newTag.tag.type as TagType,
      displayOrder: newTag.displayOrder,
    });
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

export default addTagService;
