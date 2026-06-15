import type { ProjectVideo } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectVideoSelector } from '#services/selectors/projects/parts/project-video.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleVideo = prisma.projectVideos.findMany({
  select: ProjectVideoSelector,
});

type ProjectImageGetPayload = Awaited<typeof sampleVideo>[number];

//map to shared type
export const transformProjectVideo = (
  projectId: number,
  { videoId, videoUrl, title, position }: ProjectImageGetPayload,
): ProjectVideo => {
  return {
    apiUrl: `api/projects/${projectId.toString()}/images/${videoId.toString()}`,
    videoId,
    videoUrl,
    position,
    title,
  };
};
