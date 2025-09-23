import type { MePreview, SkillType } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MePreviewSelector } from '#services/selectors/me/me-preview.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleUsers = prisma.users.findMany({
  select: MePreviewSelector,
});

type UsersGetPayload = Awaited<typeof sampleUsers>[number];

const hasSkillOfType = (skill: { skills: { type: string } }, type: SkillType): boolean => {
  return skill.skills.type === type;
};

//map to shared type
export const transformMeToPreview = (user: UsersGetPayload): MePreview => {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    profileImage: user.profileImage ?? null,
    mentor: !!user.mentor,
    developer: user.userSkills.some((skill) => hasSkillOfType(skill, 'Developer')),
    designer: user.userSkills.some((skill) => hasSkillOfType(skill, 'Designer')),
    apiUrl: `api/me`,
  };
};
