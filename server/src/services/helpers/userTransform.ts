import type { UserDetail, UserSkill, Social } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleUsers = prisma.users.findMany({
  select: {
    userId: true,
    firstName: true,
    lastName: true,
    username: true,
    profileImage: true,
    headline: true,
    pronouns: true,
    academicYear: true,
    location: true,
    funFact: true,
    jobTitles: { select: { label: true } },
    majors: { select: { label: true } },
    userSkills: {
      select: {
        position: true,
        skills: { select: { skillId: true, label: true, type: true } },
      },
    },
    userSocials: {
      select: {
        socials: { select: { websiteId: true, label: true } },
      },
    },
  },
});

type UsersGetPayload = Awaited<typeof sampleUsers>[number];

//map to shared type
export const transformUser = (user: UsersGetPayload): UserDetail => {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    profileImage: user.profileImage,
    headline: user.headline,
    pronouns: user.pronouns,
    academicYear: user.academicYear,
    location: user.location,
    funFact: user.funFact,
    jobTitle: user.jobTitles?.label ?? null,
    major: user.majors?.label ?? null,
    skills:
      user.userSkills.length > 0
        ? user.userSkills.map(
            ({
              position,
              skills,
            }: {
              position: number;
              skills: { skillId: number; label: string; type: string };
            }): UserSkill => ({
              skillId: skills.skillId,
              label: skills.label,
              type: skills.type,
              position,
            }),
          )
        : null,
    socials:
      user.userSocials.length > 0
        ? user.userSocials.map(
            ({ socials }): Social => ({
              websiteId: socials.websiteId,
              label: socials.label,
            }),
          )
        : null,
  };
};
