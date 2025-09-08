import type { ProjectImage } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import { ProjectImageSelector } from '#services/selectors/projects/parts/project-image.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type AddImageServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const addImageService = async (
  data: Prisma.ProjectImagesCreateInput,
): Promise<ProjectImage | AddImageServiceError> => {
  try {
    const result = await prisma.projectImages.create({ data, select: ProjectImageSelector });

    return result;
  } catch (e) {
    console.error('Error in addImageService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default addImageService;
