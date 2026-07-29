import prisma from '#config/prisma.ts';
import { UserDetailSelector } from '#services/selectors/users/user-detail.ts';
import { transformUserToDetail } from '#services/transformers/users/user-detail.ts';

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
      select: UserDetailSelector,
    });

    //Alphabetize array by first name ascending
    const transformedBlacklist = allUsersInBlacklist
      .map(transformUserToDetail)
      .toSorted((user1, user2) => user1.firstName.charCodeAt(0) - user2.firstName.charCodeAt(0));

    return transformedBlacklist;
  } catch (e) {
    console.error('Error in getBlacklistedUsersService:', e);
    return 'INTERNAL_ERROR';
  }
};
