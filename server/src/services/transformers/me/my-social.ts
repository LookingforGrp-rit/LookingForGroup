import type { MySocial } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MySocialSelector } from '#services/selectors/me/my-social.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleSocials = prisma.userSocials.findMany({
  select: MySocialSelector,
});

type UserSkillsGetPayload = Awaited<typeof sampleSocials>[number];

//map to shared type
export const transformMySocial = ({
  url,
  socials: { label, websiteId },
}: UserSkillsGetPayload): MySocial => {
  return {
    apiUrl: `api/me/socials/${websiteId.toString()}`,
    url,
    label,
    websiteId,
  };
};
