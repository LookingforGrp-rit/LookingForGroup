import type {
  MeDetail,
  MySkill,
  MySocial,
  SkillProficiency,
  MyMajor,
} from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MeDetailSelector } from '#services/selectors/me/me-detail.ts';
import { transformMeToPreview } from './me-preview.ts';

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
    bio: user.bio ?? '',
    academicYear: user.academicYear,
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
    skills: user.userSkills.map(
      ({
        position,
        proficiency,
        skills,
      }: {
        position: number;
        proficiency: SkillProficiency;
        skills: { skillId: number; label: string; type: string };
      }): MySkill => ({
        skillId: skills.skillId,
        label: skills.label,
        type: skills.type,
        proficiency,
        position,
        apiUrl: `/api/me/skills/${skills.skillId.toString()}`,
      }),
    ),
    socials: user.userSocials.map(
      ({ url, socials }): MySocial => ({
        websiteId: socials.websiteId,
        label: socials.label,
        url,
        apiUrl: `/api/me/socials/${socials.websiteId.toString()}`,
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
        apiUrl: `api/projects/${projectId.toString()}/mediums/${mediumId.toString()}`,
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
              apiUrl: `TODO`,
            })),
            apiUrl: `/api/projects/${projectId.toString()}`,
          }),
        ),
        apiUrl: `/api/me/followings/projects`,
      },
    },
  };
};
