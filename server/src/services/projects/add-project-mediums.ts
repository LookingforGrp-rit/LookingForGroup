import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type AddMediumsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

//the tags (or their ids anyway)
type Mediums = {
  mediums?: number[];
};

const addTagsService = async (
  projectId: number,
  data: Mediums,
): Promise<ReturnType<typeof prisma.projects.update> | AddMediumsServiceError> => {
  try {
    if (!data.mediums) return 'NOT_FOUND';

    //had to do this one like the tags because
    //unlike user skills mediums are not tied to the project
    //so we're updating the project's mediums param rather than creating new objects
    const allMediumIds = [];
    for (let i = 0; i < data.mediums.length; i++) {
      allMediumIds[i] = { mediumId: data.mediums[i] };
    }

    const result = await prisma.projects.update({
      where: {
        projectId: projectId,
      },
      data: {
        mediums: {
          connect: allMediumIds,
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

    console.error('Error in addMediumsService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default addTagsService;
