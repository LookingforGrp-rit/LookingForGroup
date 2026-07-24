import prisma from '#config/prisma.ts';
import { UserPreviewSelector } from '#services/selectors/users/user-preview.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';

//Gets the blacklist and returns it as an array of UserPreviews
export const getBlacklistedUsersService = async () => {
  try {
    const blacklist = await prisma.userBlacklist.findMany();

    const allUsersInBlacklist = await prisma.users.findMany({
      where: {
        googleId: {
          in: blacklist.map((b) => b.googleId),
        },
      },
      select: UserPreviewSelector,
    });

    //Alphabetize array by first name ascending
    const transformedBlacklist = allUsersInBlacklist
      .map(transformUserToPreview)
      .toSorted((user1, user2) => user1.firstName.charCodeAt(0) - user2.firstName.charCodeAt(0));

    return transformedBlacklist;
  } catch (e) {
    console.error('Error in addBlacklistService:', e);
    return 'INTERNAL_ERROR';
  }
};
