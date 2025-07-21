import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type UIDExistsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const uidExistsService = async (uid: number): Promise<boolean | UIDExistsServiceError> => {
  try {
    const result = await prisma.users.findUnique({ where: { userId: uid } });

    return result !== null;
  } catch (e) {
    console.error(`Error in uidExistsService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default uidExistsService;
