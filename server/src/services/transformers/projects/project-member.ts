import type { ProjectMember } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectMemberSelector } from '#services/selectors/projects/parts/project-member.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleMember = prisma.members.findMany({
  select: ProjectMemberSelector,
});

type ProjectImageGetPayload = Awaited<typeof sampleMember>[number];

//map to shared type
export const transformProjectMember = (
  projectId: number,
  {
    users: { userId, firstName, lastName, username, profileImage },
    roles: { roleId, label },
    createdAt,
  }: ProjectImageGetPayload,
): ProjectMember => {
  return {
    user: {
      userId,
      firstName,
      lastName,
      username,
      profileImage,
      apiUrl: `api/users/${userId.toString()}}`,
    },
    role: {
      roleId,
      label,
    },
    memberSince: createdAt,
    apiUrl: `/api/projects/${projectId.toString()}/members/${userId}`,
  };
};
