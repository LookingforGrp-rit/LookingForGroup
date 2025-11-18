import type { SkillType, UserPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserPreviewSelector } from '#services/selectors/users/user-preview.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleUsers = prisma.users.findMany({
  select: UserPreviewSelector,
});

type UsersGetPayload = Awaited<typeof sampleUsers>[number];

const hasSkillOfType = (type: SkillType): ((skill: { skills: { type: string } }) => boolean) => {
  return (skill) => skill.skills.type === type;
};

//map to shared type
export const transformUserToPreview = (user: UsersGetPayload): UserPreview => {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    profileImage: user.profileImage ?? null,
    headline: user.headline,
    pronouns: user.pronouns,
    location: user.location,
    title: user.title,
    funFact: user.funFact,
    mentor: user.mentor,
    developer: user.userSkills.some(hasSkillOfType('Developer')),
    designer: user.userSkills.some(hasSkillOfType('Designer')),
    apiUrl: `api/users/${user.userId.toString()}`,
  };
};
