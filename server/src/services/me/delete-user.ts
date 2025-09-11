import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteUserServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

export const deleteUserService = async (
  userId: number,
): Promise<DeleteUserServiceError | DeleteUserServiceSuccess> => {
  try {
    //user validation (does this user exist)
    const userExists = await prisma.userSocials.findFirst({
      where: {
        userId,
      },
    });

    if (!userExists) return 'NOT_FOUND';

    await Promise.all([
      prisma.userFollowings.deleteMany({ where: { senderId: userId } }),
      prisma.userFollowings.deleteMany({ where: { receiverId: userId } }),
      prisma.userSkills.deleteMany({ where: { userId } }),
      prisma.userSocials.deleteMany({ where: { userId } }),
      prisma.projectFollowings.deleteMany({ where: { userId } }),
      prisma.users.delete({ where: { userId } }),
    ]);

    return 'NO_CONTENT';
  } catch (e) {
    console.error(`Error in deleteUserService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
