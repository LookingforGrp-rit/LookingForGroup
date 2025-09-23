import type { SkillType, UserPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserPreviewSelector } from '#services/selectors/users/user-preview.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleUsers = prisma.users.findMany({
  select: UserPreviewSelector,
});

type UsersGetPayload = Awaited<typeof sampleUsers>[number];

const hasSkillOfType = (skill: { skills: { type: string } }, type: SkillType): boolean => {
  return skill.skills.type === type;
};

//map to shared type
export const transformUserToPreview = (user: UsersGetPayload): UserPreview => {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    profileImage: user.profileImage ?? null,
    mentor: !!user.mentor,
    developer: user.userSkills.some((skill) => hasSkillOfType(skill, 'Developer')),
    designer: user.userSkills.some((skill) => hasSkillOfType(skill, 'Designer')),
    apiUrl: `api/users/${user.userId.toString()}`,
  };
};
