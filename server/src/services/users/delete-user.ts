import prisma from '#config/prisma.ts';

export const deleteUserService = async (userId: number): Promise<string> => {
  try {
    await Promise.all([
      prisma.userFollowings.deleteMany({ where: { userId } }),
      prisma.userSkills.deleteMany({ where: { userId } }),
      prisma.userSocials.deleteMany({ where: { userId } }),
      prisma.users.delete({ where: { userId } }),
      prisma.projectFollowings.deleteMany({ where: { userId } }),
    ]);

    return '';
  } catch (e) {
    console.error(`Error in getUserFollowing: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
