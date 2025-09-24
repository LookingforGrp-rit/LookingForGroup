import type { Social } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { SocialSelector } from '#services/selectors/datasets/social.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleSocials = prisma.socials.findMany({
  select: SocialSelector,
});

type SocialsGetPayload = Awaited<typeof sampleSocials>[number];

//map to shared type
export const transformSocial = ({ websiteId, label }: SocialsGetPayload): Social => {
  return {
    websiteId,
    label,
  };
};
