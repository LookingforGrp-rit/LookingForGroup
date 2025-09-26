import type { Visibility, MePrivate } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MePrivateSelector } from '#services/selectors/me/me-private.ts';
import { transformMeToDetail } from './me-detail.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleUsers = prisma.users.findMany({
  select: MePrivateSelector,
});

type UsersGetPayload = Awaited<typeof sampleUsers>[number];

//map to shared type
export const transformMeToPrivate = (user: UsersGetPayload): MePrivate => {
  return {
    ...transformMeToDetail(user),
    ritEmail: user.ritEmail,
    visibility: user.visibility as Visibility,
    phoneNumber: user.phoneNumber ?? null,
    universityId: user.universityId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
