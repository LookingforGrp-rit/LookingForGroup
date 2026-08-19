import type { SkillType, UserPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { UserPreviewSelector } from '#services/selectors/users/user-preview.ts';
import { transformMajor } from '../datasets/major.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleUsers = prisma.users.findMany({
  select: UserPreviewSelector,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleBlocklist = prisma.blocklist.findMany({
  select: {
    blocked: {
      select: UserPreviewSelector,
    },
  },
});

type UsersGetPayload = Awaited<typeof sampleUsers>[number];
type BlocklistGetPayload = Awaited<typeof sampleBlocklist>[number];

const hasSkillOfType = (type: SkillType): ((skill: { skills: { type: string } }) => boolean) => {
  return (skill) => skill.skills.type === type;
};

//map to shared type
export const transformUserToPreview = (user: UsersGetPayload): UserPreview => {
  const userPreview = {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    profileImage: user.profileImage ?? null,
    headline: user.headline,
    pronouns: user.pronouns,
    location: user.location,
    title: user.title,
    privacy: user.privacy,
    displayPhone: user.displayPhone,
    majors: user.majors.map(transformMajor),
    developer: user.userSkills.some(hasSkillOfType('Developer')),
    designer: user.userSkills.some(hasSkillOfType('Designer')),
    apiUrl: `api/users/${user.userId.toString()}`,
    ritStatus: user.ritStatus,
    skills: user.userSkills.map(({ position, proficiency, skills }) => ({
      position,
      proficiency,
      ...skills,
    })),
  } as UserPreview;

  if (user.displayPhone) {
    userPreview.phoneNumber = user.phoneNumber;
  }
  return userPreview;
};

export const transformBlocklistToPreview = (blocklistData: BlocklistGetPayload): UserPreview => {
  const user = blocklistData.blocked;
  const userPreview = {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    profileImage: user.profileImage ?? null,
    headline: user.headline,
    pronouns: user.pronouns,
    location: user.location,
    title: user.title,
    privacy: user.privacy,
    displayPhone: user.displayPhone,
    majors: user.majors.map(transformMajor),
    developer: user.userSkills.some(hasSkillOfType('Developer')),
    designer: user.userSkills.some(hasSkillOfType('Designer')),
    apiUrl: `api/users/${user.userId.toString()}`,
  } as UserPreview;

  if (user.displayPhone) {
    userPreview.phoneNumber = user.phoneNumber;
  }
  return userPreview;
};
