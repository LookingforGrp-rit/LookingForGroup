import type { ProjectSocial } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectSocialSelector } from '#services/selectors/projects/parts/project-social.ts';
import { transformSocial } from '#services/transformers/datasets/social.ts';

//sample project social from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleSocial = prisma.projectSocials.findMany({
  select: ProjectSocialSelector,
});

type ProjectSocialGetPayload = Awaited<typeof sampleSocial>[number];

//map to shared type
export const transformProjectSocial = (
  projectId: number,
  { id, url, alias, socials: { websiteId, label } }: ProjectSocialGetPayload,
): ProjectSocial => {
  return {
    id,
    url,
    alias,
    apiUrl: `/api/projects/${projectId.toString()}/socials/${id.toString()}`,
    ...transformSocial({ websiteId, label }),
  };
};
