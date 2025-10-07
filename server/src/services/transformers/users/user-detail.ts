import type { UserDetail, UserSkill, UserSocial } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserDetailSelector } from '#services/selectors/users/user-detail.ts';
import { transformMajor } from '../datasets/major.ts';
import { transformSkill } from '../datasets/skill.ts';
import { transformSocial } from '../datasets/social.ts';
import { transformProjectToPreview } from '../projects/project-preview.ts';
import { transformUserMember } from './parts/user-member.ts';
import { transformUserToPreview } from './user-preview.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleUsers = prisma.users.findMany({
  select: UserDetailSelector,
});

type UsersGetPayload = Awaited<typeof sampleUsers>[number];

//map to shared type
export const transformUserToDetail = (user: UsersGetPayload): UserDetail => {
  return {
    ...transformUserToPreview(user),
    headline: user.headline,
    pronouns: user.pronouns,
    bio: user.bio,
    academicYear: user.academicYear,
    location: user.location,
    funFact: user.funFact,
    title: user.title,
    majors: user.majors.map(transformMajor),
    skills: user.userSkills.map(
      ({ position, proficiency, skills }): UserSkill => ({
        ...transformSkill(skills),
        proficiency,
        position,
      }),
    ),
    socials: user.userSocials.map(
      ({ url, socials }): UserSocial => ({
        ...transformSocial(socials),
        url,
      }),
    ),
    projects: user.members.map(transformUserMember),
    followers: {
      users: user.followers.map(({ senderUser, followedAt }) => ({
        followedAt,
        user: transformUserToPreview(senderUser),
      })),
      count: user._count.followers,
      apiUrl: `/api/users/${user.userId.toString()}/followers`,
    },
    following: {
      usersFollowing: {
        users: user.following.map(({ receiverUser, followedAt }) => ({
          followedAt,
          user: transformUserToPreview(receiverUser),
        })),
        count: user._count.following,
        apiUrl: `/api/users/${user.userId.toString()}/followings/people`,
      },
      projectsFollowing: {
        count: user._count.projectFollowings,
        projects: user.projectFollowings.map(({ projects, followedAt }) => ({
          followedAt,
          project: transformProjectToPreview(projects),
        })),
        apiUrl: `/api/users/${user.userId.toString()}/followings/projects`,
      },
    },
  };
};
