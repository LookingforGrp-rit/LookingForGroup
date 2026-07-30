import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type DeleteSessionsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;
type DeleteSessionsServiceSuccess = ServiceSuccessSubset<'OK'>;

//removes every session belonging to a google id
const deleteSessionsByGoogleService = async (
  googleId: string,
): Promise<DeleteSessionsServiceSuccess | DeleteSessionsServiceError> => {
  try {
    await prisma.session.deleteMany({
      where: {
        gid: googleId,
      },
    });

    return 'OK';
  } catch (e) {
    console.error('Error in deleteSessionsByGoogleService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default deleteSessionsByGoogleService;
