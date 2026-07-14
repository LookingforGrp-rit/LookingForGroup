import { SocialSelector } from '#services/selectors/datasets/social.ts';

export const MySocialSelector = Object.freeze({
  url: true,
  alias: true,
  socials: { select: SocialSelector },
});
