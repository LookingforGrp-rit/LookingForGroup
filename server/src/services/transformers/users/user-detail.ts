import type {
  UserDetail,
  UserSkill,
  SkillProficiency,
  Major,
  UserSocial,
} from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserDetailSelector } from '#services/selectors/users/user-detail.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleUsers = prisma.users.findMany({
  select: UserDetailSelector,
});

type UsersGetPayload = Awaited<typeof sampleUsers>[number];

//map to shared type
export const transformUserToDetail = (user: UsersGetPayload): UserDetail => {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    profileImage: user.profileImage,
    headline: user.headline,
    pronouns: user.pronouns,
    bio: user.bio ?? '',
    academicYear: user.academicYear,
    location: user.location,
    funFact: user.funFact,
    title: user.title,
    majors: user.majors.map(
      ({ majorId, label }: { majorId: number; label: string }): Major => ({
        majorId,
        label,
      }),
    ),
    skills: user.userSkills.map(
      ({
        position,
        proficiency,
        skills,
      }: {
        position: number;
        proficiency: SkillProficiency;
        skills: { skillId: number; label: string; type: string };
      }): UserSkill => ({
        skillId: skills.skillId,
        label: skills.label,
        type: skills.type,
        proficiency,
        position,
      }),
    ),
    socials: user.userSocials.map(
      ({ url, socials }): UserSocial => ({
        websiteId: socials.websiteId,
        label: socials.label,
        url,
      }),
    ),
    projects: user.members.map(({ projects: { projectId, title, hook, thumbnail, mediums } }) => ({
      projectId,
      title,
      hook,
      thumbnail,
      mediums: mediums.map(({ mediumId, label }) => ({
        mediumId,
        label,
      })),
      apiUrl: `api/projects/${projectId.toString()}`,
    })),
    followers: {
      users: user.followers.map(
        ({ receiverUser: { userId, username, firstName, lastName, profileImage } }) => ({
          userId,
          username,
          firstName,
          lastName,
          profileImage,
          apiUrl: `/api/users/${userId.toString()}`,
        }),
      ),
      count: user._count.followers,
      apiUrl: `/api/me/followers`,
    },
    following: {
      usersFollowing: {
        users: user.following.map(
          ({ senderUser: { userId, username, firstName, lastName, profileImage } }) => ({
            userId,
            username,
            firstName,
            lastName,
            profileImage,
            apiUrl: `/api/users/${userId.toString()}`,
          }),
        ),
        count: user._count.following,
        apiUrl: '/api/me/followings/people',
      },
      projectsFollowing: {
        count: user._count.projectFollowings,
        projects: user.projectFollowings.map(
          ({ projects: { projectId, title, hook, thumbnail, mediums } }) => ({
            projectId,
            title,
            hook,
            thumbnail,
            mediums: mediums.map(({ mediumId, label }) => ({
              mediumId,
              label,
            })),
            apiUrl: `/api/projects/${projectId.toString()}`,
          }),
        ),
        apiUrl: `/api/me/followings/projects`,
      },
    },
    apiUrl: `api/users/${user.userId.toString()}`,
  };
};
