import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type AddBlacklistServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;
type AddBlacklistServiceSuccess = ServiceSuccessSubset<'OK'>;

//PUT api/mod/ban-user/{id}
//add a user to blacklist
const addBlacklistService = async (
  userId: number,
  reason: string,
): Promise<AddBlacklistServiceSuccess | AddBlacklistServiceError> => {
  try {
    //check if user exists
    const user = await prisma.users.findUnique({
      where: {
        userId,
      },
    });

    if (user === null) return 'NOT_FOUND';

    //Attempt to add to blacklist
    await prisma.userBlacklist.create({
      data: {
        googleId: user.googleId,
        banReason: reason,
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
