import { MeDetailSelector } from './me-detail.ts';

export const MePrivateSelector = Object.freeze({
  ...MeDetailSelector,
  ritEmail: true,
  privacy: true,
  phoneNumber: true,
  googleId: true,
  createdAt: true,
  updatedAt: true,
  displayPhone: true,
  tagBlacklist: true,
});
