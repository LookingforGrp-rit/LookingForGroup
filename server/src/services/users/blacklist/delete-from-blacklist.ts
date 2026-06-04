import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type DeleteBlacklistServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteBlacklistServiceSuccess = ServiceSuccessSubset<'OK'>;

//DELETE api/mod/unban-user/{id}
//unbans a user
const deleteBlacklistService = async (
  googleId: string,
): Promise<DeleteBlacklistServiceSuccess | DeleteBlacklistServiceError> => {
  try {
    await prisma.userBlacklist.delete({
      where: {
        googleId: googleId,
      },
    });

    return 'OK';
  } catch (e) {
    if (e instanceof Object && 'code' in e) {
      if (e.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }

    console.error('Error in addBlacklistService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default deleteBlacklistService;
