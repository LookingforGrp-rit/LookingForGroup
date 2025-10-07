import type { MyMember } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MyMemberSelector } from '#services/selectors/me/parts/my-member.ts';
import { transformRole } from '#services/transformers/datasets/role.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleMember = prisma.members.findMany({
  select: MyMemberSelector,
});

type UserMembersGetPayload = Awaited<typeof sampleMember>[number];

//map to shared type
export const transformMyMember = ({
  projects,
  profileVisibility,
  roles,
  createdAt,
}: UserMembersGetPayload): MyMember => {
  return {
    project: transformProjectToPreview(projects),
    visibility: profileVisibility === 'private' ? 'Private' : 'Public',
    role: transformRole(roles),
    memberSince: createdAt,
    apiUrl: `/api/me/projects/${projects.projectId.toString()}}`,
  };
};
