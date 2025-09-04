import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type AddTagsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

//the tags (or their idsanyway)
type Tags = {
  tags?: number[];
};

const addTagsService = async (
  projectId: number,
  data: Tags,
): Promise<ReturnType<typeof prisma.projects.update> | AddTagsServiceError> => {
  try {
    if (!data.tags) return 'NOT_FOUND';

    //the tagIds, but as an array of objects
    //maybe i should just ask for this instead of making it here...
    //eh it'll be fine
    const allTagIds = [];
    for (let i = 0; i < data.tags.length; i++) {
      allTagIds[i] = { tagId: data.tags[i] };
    }

    const result = await prisma.projects.update({
      where: {
        projectId: projectId,
      },
      data: {
        tags: {
          connect: allTagIds,
        },
      },
    });

    return result;
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
