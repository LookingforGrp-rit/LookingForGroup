import type { ProjectMember } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectMemberSelector } from '#services/selectors/projects/parts/project-member.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleMember = prisma.members.findMany({
  select: ProjectMemberSelector,
});

type ProjectImageGetPayload = Awaited<typeof sampleMember>[number];

//map to shared type
export const transformProjectMember = (
  projectId: number,
  { users, roles: { roleId, label }, createdAt }: ProjectImageGetPayload,
): ProjectMember => {
  return {
    user: transformUserToPreview(users),
    role: {
      roleId,
      label,
    },
    memberSince: createdAt,
    apiUrl: `/api/projects/${projectId.toString()}/members/${users.userId.toString()}`,
  };
};
