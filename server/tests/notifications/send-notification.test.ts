import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { ModGeneralNotificationBuilder } from '#notification-templates/mod-general-notification.ts';
import sendNotificationService from '#services/notifications/send-notification.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findFirst: vi.fn(),
    },
    notifications: {
      create: vi.fn(),
    },
  },
}));

const now = new Date();

const prismaNotification = {
  notificationId: 1,
  receiverId: 1,
  subjectLine: 'Test Notification',
  message: 'This is a test notification.',
  hasBeenRead: true,
  timeSent: now,
  isGlobal: false,
};

describe('sendNotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns CREATED the notifications when is sent', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue({ firstName: 'Eric' } as any);
    vi.mocked(prisma.notifications.create).mockResolvedValue(prismaNotification as any);

    const result = await sendNotificationService(new ModGeneralNotificationBuilder(), {
      body: {
        modUserId: 1,
        receiverId: 2,
        subjectLine: 'Big Update',
        message: 'We have a big update for you!',
        type: 'General',
      },
      currentUser: { username: 'moderator', userId: 1, accessLevel: 'Moderator' },
    } as any);

    expect(result).toBe('CREATED');
  });

  it('returns CONFLICT when a conflict is found', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue({ firstName: 'Eric' } as any);
    vi.mocked(prisma.notifications.create).mockRejectedValue({ code: 'P2003' });

    const result = await sendNotificationService(new ModGeneralNotificationBuilder(), {
      body: {
        modUserId: 1,
        receiverId: 2,
        subjectLine: 'Big Update',
        message: 'We have a big update for you!',
        type: 'General',
      },
      currentUser: { username: 'moderator', userId: 1, accessLevel: 'Moderator' },
    } as any);

    expect(result).toBe('CONFLICT');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.notifications.create).mockRejectedValue(new Error('db cursed'));

    const result = await sendNotificationService(new ModGeneralNotificationBuilder(), {
      body: {
        modUserId: 1,
        receiverId: 2,
        subjectLine: 'Big Update',
        message: 'We have a big update for you!',
        type: 'General',
      },
      currentUser: { username: 'moderator', userId: 1, accessLevel: 'Moderator' },
    } as any);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
