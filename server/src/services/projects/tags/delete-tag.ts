import prisma from '#config/prisma.ts';
import getTagsService from '#services/projects/tags/get-proj-tags.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteTagServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteTagServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

//DELETE api/projects/{id}/tags/{tagId}
//delete a tag
export const deleteTagService = async (
  projectId: number,
  tagId: number,
): Promise<DeleteTagServiceSuccess | DeleteTagServiceError> => {
  try {
    await prisma.projectTags.delete({
      where: {
        projectId_tagId: {
          projectId,
          tagId: tagId,
        },
      },
    });

    const tags = await getTagsService(projectId);

    if (tags === 'INTERNAL_ERROR' || tags === 'NOT_FOUND') {
      return tags;
    }

    for (let i = 0; i < tags.length; i++) {
      const currentTag = tags[i];
      if (currentTag.displayOrder !== i + 1) {
        await prisma.projectTags.update({
          where: {
            projectId_tagId: {
              projectId,
              tagId: currentTag.tagId,
            },
          },
          data: {
            displayOrder: i + 1,
          },
        });
      }
    }

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteMediumsService:', error);

    if (error instanceof Object && 'code' in error) {
      if (error.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }

    return 'INTERNAL_ERROR';
  }
};
