import type { Role } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type GetRolesServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const getRolesService = async (): Promise<Role[] | GetRolesServiceError> => {
  try {
    return await prisma.roles.findMany();
  } catch (e) {
    console.error(`Error in getRolesService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getRolesService;
