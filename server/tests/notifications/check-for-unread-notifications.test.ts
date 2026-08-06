import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import checkForUnreadNotificationsService from '#services/notifications/check-for-unread-notifications.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    notifications: {
      findMany: vi.fn(),
    },
  },
}));

const prismaNotifications = [
  {
    notificationId: 1,
    receiverId: 1,
    subjectLine: 'Test Notification',
    message: 'This is a test notification.',
    hasBeenRead: false,
    timeSent: new Date(),
    isGlobal: false,
  },
  {
    notificationId: 2,
    receiverId: 1,
    subjectLine: 'Test Global Notification',
    message: 'This is a test global notification.',
    hasBeenRead: false,
    timeSent: new Date(),
    isGlobal: true,
  },
];

describe('checkForUnreadNotificationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when there are unread notifications', async () => {
    vi.mocked(prisma.notifications.findMany).mockResolvedValue(prismaNotifications as any);

    const result = await checkForUnreadNotificationsService(1);

    expect(result).toBe(true);
  });

  it('returns false when there are no unread notifications', async () => {
    vi.mocked(prisma.notifications.findMany).mockResolvedValue([]);

    const result = await checkForUnreadNotificationsService(1);

    expect(result).toBe(false);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.notifications.findMany).mockRejectedValue(new Error('db cursed'));

    const result = await checkForUnreadNotificationsService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
