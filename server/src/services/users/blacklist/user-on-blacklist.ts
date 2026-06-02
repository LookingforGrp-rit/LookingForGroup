import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type AddBlacklistServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type AddBlacklistServiceSuccess = ServiceSuccessSubset<'OK'>;

//Checks if a user is on the blacklist
//To be used when they attempt to log in

//NOTE: OK means they ARE blacklisted, so they should NOT be able to sign in!
//Likewise, NOT_FOUND means they are NOT blacklisted, so they SHOULD be able to sign in
const userOnBlacklistService = async (
  googleId: string,
): Promise<AddBlacklistServiceSuccess | AddBlacklistServiceError> => {
  try {
    //check if user exists

    const user = await prisma.userBlacklist.findUnique({
      where: {
        googleId: googleId,
      },
    });

    if (user === null) return 'NOT_FOUND';

    return 'OK';
  } catch (e) {
    console.error('Error in addBlacklistService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default userOnBlacklistService;
