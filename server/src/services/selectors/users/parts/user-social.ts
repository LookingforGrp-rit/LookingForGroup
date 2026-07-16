import { SocialSelector } from '#services/selectors/datasets/social.ts';

export const UserSocialSelector = Object.freeze({
  url: true,
  socials: { select: SocialSelector },
});
