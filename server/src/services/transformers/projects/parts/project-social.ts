import type { ProjectSocial } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectSocialSelector } from '#services/selectors/projects/parts/project-social.ts';

//sample project social from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleSocial = prisma.projectSocials.findMany({
  select: ProjectSocialSelector,
});

type ProjectSocialGetPayload = Awaited<typeof sampleSocial>[number];

//map to shared type
export const transformProjectSocial = (
  projectId: number,
  { url, socials: { websiteId, label } }: ProjectSocialGetPayload,
): ProjectSocial => {
  return {
    url,
    apiUrl: `/api/projects/${projectId.toString()}/socials/${websiteId.toString()}`,
    websiteId,
    label,
  };
};
