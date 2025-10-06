import type { MeDetail, MyMajor, AcademicYear } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MeDetailSelector } from '#services/selectors/me/me-detail.ts';
import { transformProjectToPreview } from '../projects/project-preview.ts';
import { transformUserToPreview } from '../users/user-preview.ts';
import { transformMeToPreview } from './me-preview.ts';
import { transformMyMember } from './parts/my-member.ts';
import { transformMySkill } from './parts/my-skill.ts';
import { transformMySocial } from './parts/my-social.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleUsers = prisma.users.findMany({
  select: MeDetailSelector,
});

type UsersGetPayload = Awaited<typeof sampleUsers>[number];

//map to shared type
export const transformMeToDetail = (user: UsersGetPayload): MeDetail => {
  return {
    ...transformMeToPreview(user),
    headline: user.headline,
    pronouns: user.pronouns,
    bio: user.bio,
    academicYear: user.academicYear as AcademicYear,
    location: user.location,
    funFact: user.funFact,
    title: user.title,
    majors: user.majors.map(
      ({ majorId, label }: { majorId: number; label: string }): MyMajor => ({
        majorId,
        label,
        apiUrl: `/api/me/majors/${majorId.toString()}`,
      }),
    ),
    skills: user.userSkills.map(transformMySkill),
    socials: user.userSocials.map(transformMySocial),
    projects: user.members.map(transformMyMember),
    followers: {
      users: user.followers.map(({ senderUser, createdAt }) => ({
        followedAt: createdAt,
        user: transformUserToPreview(senderUser),
      })),
      count: user._count.followers,
      apiUrl: `/api/me/followers`,
    },
    following: {
      usersFollowing: {
        users: user.following.map(({ receiverUser, createdAt }) => ({
          followedAt: createdAt,
          user: transformUserToPreview(receiverUser),
          apiUrl: `/api/me/followings/people/${receiverUser.userId.toString()}`,
        })),
        count: user._count.following,
        apiUrl: '/api/me/followings/people',
      },
      projectsFollowing: {
        count: user._count.projectFollowings,
        projects: user.projectFollowings.map(({ projects, createdAt }) => ({
          followedAt: createdAt,
          project: transformProjectToPreview(projects),
          apiUrl: `/api/me/followings/people/${projects.projectId.toString()}`,
        })),
        apiUrl: `/api/me/followings/projects`,
      },
    },
  };
};
