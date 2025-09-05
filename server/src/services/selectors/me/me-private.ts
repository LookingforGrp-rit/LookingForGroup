import { MeDetailSelector } from './me-detail.ts';

export const MePrivateSelector = Object.freeze({
  ...MeDetailSelector,
  ritEmail: true,
  visibility: true,
  phoneNumber: true,
  universityId: true,
  createdAt: true,
  updatedAt: true,
});
