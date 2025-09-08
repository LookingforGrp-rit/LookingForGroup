import type { ProjectTag } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectTagSelector } from '#services/selectors/projects/parts/project-tag.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectTag } from '#services/transformers/projects/parts/project-tag.ts';

type AddTagsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

//the tags (or their ids anyway)
type TagInputs = {
  tagIds?: number[];
};

const addTagsService = async (
  projectId: number,
  data: TagInputs,
): Promise<ProjectTag[] | AddTagsServiceError> => {
  try {
    if (!data.tagIds) return 'NOT_FOUND';

    //the tagIds, but as an array of objects
    //maybe i should just ask for this instead of making it here...
    //or have frontend autogenerate it...
    //eh it'll be fine
    const allTagIds = [];
    for (let i = 0; i < data.tagIds.length; i++) {
      allTagIds[i] = { tagId: data.tagIds[i] };
    }

    const newTags = await prisma.projects.update({
      where: {
        projectId: projectId,
      },
      data: {
        tags: {
          connect: allTagIds, //that for loop was just so i could do this
        },
      },
      include: {
        tags: {
          where: {
            tagId: {
              in: data.tagIds,
            },
          },
          select: ProjectTagSelector,
        },
      },
    });

    return newTags.tags.map((tag) => transformProjectTag(projectId, tag));
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
