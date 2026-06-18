import type { Role } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { RoleSelector } from '#services/selectors/datasets/role.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformRole } from '#services/transformers/datasets/role.ts';

type GetRolesServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

//GET api/datasets/roles
const getRolesService = async (): Promise<Role[] | GetRolesServiceError> => {
  try {
    let roles = await prisma.roles.findMany({
      select: RoleSelector,

      orderBy: {
        label: 'asc',
      },
    });

    //Should sort the array alphabetically
    roles = roles.toSorted((roleA, roleB) => roleA.label.charCodeAt(0) - roleB.label.charCodeAt(0));
    return roles.map(transformRole);
  } catch (e) {
    console.error(`Error in getRolesService: ${e as Error}`);
    return 'INTERNAL_ERROR';
  }
};

export default getRolesService;
