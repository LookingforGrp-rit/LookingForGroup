import type { BanDetail } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';

//GET api/users/ban-user/{id}
//Gets the blacklist and returns in BanDetail
export const getBanDetailService = async (
  id: number,
): Promise<BanDetail | 'NOT_FOUND' | 'INTERNAL_ERROR'> => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        userId: id,
      },
    });

    if (!user) return 'NOT_FOUND';

    const blacklist = await prisma.userBlacklist.findUnique({
      where: {
        googleId: user.googleId,
      },
    });

    if (!blacklist) return 'NOT_FOUND';

    return {
      banReason: blacklist.banReason,
    };
  } catch (e) {
    console.error('Error in getBanDetailService:', e);
    return 'INTERNAL_ERROR';
  }
};
