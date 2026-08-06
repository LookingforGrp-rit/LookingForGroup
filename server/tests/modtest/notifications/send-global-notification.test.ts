import type { AuthenticatedRequest, ModeratorNotificationInput } from '@looking-for-group/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import prisma from '#config/prisma.ts';
import { ModGeneralNotificationBuilder } from '#notification-templates/mod-general-notification.ts';
import sendGlobalNotificationService from '#services/mod/notifications/send-global-notification.ts';
import sendNotificationService from '#services/notifications/send-notification.ts';

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/notifications/send-notification.ts', () => ({
  default: vi.fn(),
}));

const prismaUsers = [{ userId: 1 }, { userId: 2 }, { userId: 3 }];

const notificationData: ModeratorNotificationInput = {
  modUserId: 1,
  receiverId: 2,
  subjectLine: 'Big Update',
  message: 'We have a big update for you!',
  type: 'General',
};

const request = {
  body: notificationData,
  currentUser: { username: 'moderator', userId: 1, accessLevel: 'Moderator' },
} as AuthenticatedRequest;

describe('sendGlobalNotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendNotificationService).mockResolvedValue('CREATED');
  });

  it('returns CREATED when all notifications are sent successfully', async () => {
    vi.mocked(prisma.users.findMany).mockResolvedValue(prismaUsers as any);

    const builder = new ModGeneralNotificationBuilder();
    const result = await sendGlobalNotificationService(builder, request);

    expect(result).toBe('CREATED');
    expect(prisma.users.findMany).toHaveBeenCalledWith({ select: { userId: true } });
    expect(sendNotificationService).toHaveBeenCalledTimes(prismaUsers.length);

    prismaUsers.forEach((user, index) => {
      const [calledBuilder, calledRequest, isGlobal] =
        vi.mocked(sendNotificationService).mock.calls[index];

      expect(calledBuilder).toBe(builder);
      expect(calledRequest).toMatchObject({
        body: {
          ...notificationData,
          receiverId: user.userId,
        },
      });
      expect(isGlobal).toBe(true);
    });
  });

  it('returns INTERNAL_ERROR when any notification send returns a non-CREATED result', async () => {
    vi.mocked(prisma.users.findMany).mockResolvedValue(prismaUsers as any);
    vi.mocked(sendNotificationService).mockResolvedValueOnce('INTERNAL_ERROR');

    const result = await sendGlobalNotificationService(
      new ModGeneralNotificationBuilder(),
      request,
    );

    expect(result).toBe('INTERNAL_ERROR');
    expect(sendNotificationService).toHaveBeenCalledTimes(prismaUsers.length);
  });

  it('returns CONFLICT when a notification send rejects with P2003', async () => {
    vi.mocked(prisma.users.findMany).mockResolvedValue(prismaUsers as any);
    vi.mocked(sendNotificationService).mockRejectedValueOnce({ code: 'P2003' });

    const result = await sendGlobalNotificationService(
      new ModGeneralNotificationBuilder(),
      request,
    );

    expect(result).toBe('CONFLICT');
    expect(sendNotificationService).toHaveBeenCalledTimes(prismaUsers.length);
  });

  it('returns INTERNAL_ERROR when retrieving users throws', async () => {
    vi.mocked(prisma.users.findMany).mockRejectedValue(new Error('db cursed'));

    const result = await sendGlobalNotificationService(
      new ModGeneralNotificationBuilder(),
      request,
    );

    expect(result).toBe('INTERNAL_ERROR');
    expect(sendNotificationService).not.toHaveBeenCalled();
  });
});
