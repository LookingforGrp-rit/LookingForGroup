import type { Role } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { RoleSelector } from '#services/selectors/datasets/role.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformRole } from '#services/transformers/datasets/role.ts';

type GetRolesServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const getRolesService = async (): Promise<Role[] | GetRolesServiceError> => {
  try {
    const roles = await prisma.roles.findMany({
      select: RoleSelector,
    });

    return roles.map(transformRole);
  } catch (e) {
    console.error(`Error in getRolesService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getRolesService;
