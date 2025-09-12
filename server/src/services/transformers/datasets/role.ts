import type { Role } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { RoleSelector } from '#services/selectors/datasets/role.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleRoles = prisma.roles.findMany({
  select: RoleSelector,
});

type RolesGetPayload = Awaited<typeof sampleRoles>[number];

//map to shared type
export const transformRole = ({ roleId, label }: RolesGetPayload): Role => {
  return {
    roleId,
    label,
  };
};
