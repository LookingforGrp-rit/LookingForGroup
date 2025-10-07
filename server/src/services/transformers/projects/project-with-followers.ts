import type { ProjectWithFollowers } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectWithFollowersSelector } from '#services/selectors/projects/projects-with-followers.ts';
import { transformProjectToFollowers } from './parts/project-followers.ts';
import { transformProjectToDetail } from './project-detail.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleProjectWithFollowers = prisma.projects.findMany({
  select: ProjectWithFollowersSelector,
});

type ProjectsGetPayload = Awaited<typeof sampleProjectWithFollowers>[number];

//map to shared type
export const transformProjectToWithFollowers = (
  project: ProjectsGetPayload,
): ProjectWithFollowers => {
  return {
    ...transformProjectToDetail(project),
    followers: transformProjectToFollowers(project),
  };
};
