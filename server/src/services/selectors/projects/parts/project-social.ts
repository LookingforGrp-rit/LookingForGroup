import { SocialSelector } from '#services/selectors/datasets/social.ts';

export const ProjectSocialSelector = Object.freeze({
  socials: { select: SocialSelector },
  id: true,
  url: true,
  alias: true,
});
