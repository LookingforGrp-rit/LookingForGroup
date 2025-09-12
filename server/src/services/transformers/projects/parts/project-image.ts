import type { ProjectImage } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectImageSelector } from '#services/selectors/projects/parts/project-image.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleImage = prisma.projectImages.findMany({
  select: ProjectImageSelector,
});

type ProjectImageGetPayload = Awaited<typeof sampleImage>[number];

//map to shared type
export const transformProjectImage = (
  projectId: number,
  { imageId, image, altText }: ProjectImageGetPayload,
): ProjectImage => {
  return {
    apiUrl: `api/projects/${projectId.toString()}/images/${imageId.toString()}`,
    imageId,
    image,
    altText,
  };
};
