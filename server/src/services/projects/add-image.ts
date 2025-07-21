import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type AddImageServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const addImageService = async (
  data: Prisma.ProjectImagesCreateInput,
): Promise<Prisma.ProjectImagesCreateWithoutProjectsInput | AddImageServiceError> => {
  try {
    const result = await prisma.projectImages.create({ data });
    return result;
  } catch (e) {
    console.error('Error in addImageService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default addImageService;
