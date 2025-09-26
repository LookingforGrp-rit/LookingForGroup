import type { UserMember } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserMemberSelector } from '#services/selectors/users/parts/user-member.ts';
import { transformRole } from '#services/transformers/datasets/role.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleMember = prisma.members.findMany({
  select: UserMemberSelector,
});

type UserMembersGetPayload = Awaited<typeof sampleMember>[number];

//map to shared type
export const transformUserMember = ({
  userId,
  projects,
  profileVisibility,
  roles,
  createdAt,
}: UserMembersGetPayload): UserMember => {
  return {
    project: transformProjectToPreview(projects),
    visibility: profileVisibility === 'private' ? 'Private' : 'Public',
    role: transformRole(roles),
    memberSince: createdAt,
    apiUrl: `/api/projects/${projects.projectId.toString()}/members/${userId.toString()}`,
  };
};
