import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type AddBlacklistServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;
type AddBlacklistServiceSuccess = ServiceSuccessSusbet<'OK'>;

//PATCH api/mod/ban-user/{id}
//add a tag
const addBlacklistService = async (
  userId: number,
): Promise<AddBlacklistServiceSuccess | AddBlacklistServiceError> => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        userId: userId,
      },
    });

    if (user === null) return 'NOT_FOUND';

    await prisma.userBlacklist.create({
      data: {
        userId: userId,
      },
    });

    return 'OK';
  } catch (e) {
    if (e instanceof Object && 'code' in e) {
      if (e.code === 'P2002') {
        return 'CONFLICT';
      }
    }

    console.error('Error in addBlacklistService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default addBlacklistService;
