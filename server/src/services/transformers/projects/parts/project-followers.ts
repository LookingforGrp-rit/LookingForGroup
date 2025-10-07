import type { ProjectFollowers } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectFollowersSelector } from '#services/selectors/projects/parts/project-followers.ts';
import { transformUserToPreview } from '../../users/user-preview.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleProjectFollowers = prisma.projects.findMany({
  select: ProjectFollowersSelector,
});

type ProjectsGetPayload = Awaited<typeof sampleProjectFollowers>[number];

//map to shared type
export const transformProjectToFollowers = (project: ProjectsGetPayload): ProjectFollowers => {
  return {
    count: project._count.projectFollowings,
    users: project.projectFollowings.map(({ users, followedAt }) => ({
      followedAt,
      user: transformUserToPreview(users),
    })),
    apiUrl: `/api/projects/${project.projectId.toString()}/followers`,
  };
};
