import prisma from '#config/prisma.ts';
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
      select: {
        userId: true,
        username: true,
        firstName: true,
        lastName: true,
        preferredName: true,
        profileImage: true,
        mentor: true,
        headline: true,
        pronouns: true,
        title: true,
        location: true,
        funFact: true,
        majors: {
          select: {
            majorId: true,
            label: true,
          },
        },
        userSkills: {
          select: {
            skills: {
              select: {
                skillId: true,
                label: true,
                type: true,
              },
            },
          },
        },
      },
    });

    //Alphabetize array by first name ascending
    const transformedBlacklist = allUsersInBlacklist
      .map(transformUserToPreview)
      .toSorted((user1, user2) => user1.firstName.charCodeAt(0) - user2.firstName.charCodeAt(0));

    //For when preferredName is implemented
    // transformedBlacklist = transformedBlacklist.toSorted((user1, user2) =>
    //     user1.preferredName.charCodeAt(0) - user2.preferredName.charCodeAt(0));

    return transformedBlacklist;
  } catch (e) {
    console.error('Error in addBlacklistService:', e);
    return 'INTERNAL_ERROR';
  }
};
