import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getNotificationService from '#services/notifications/get-notification.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    notifications: {
      findFirst: vi.fn(),
    },
  },
}));

const prismaNotification = {
  notificationId: 1,
  receiverId: 1,
  subjectLine: 'Test Notification',
  message: 'This is a test notification.',
  hasBeenRead: true,
  timeSent: new Date(),
  isGlobal: false,
};

describe('getNotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the notification when found', async () => {
    vi.mocked(prisma.notifications.findFirst).mockResolvedValue(prismaNotification as any);

    const result = await getNotificationService('1', 1);

    expect(result).toBe(prismaNotification);
  });

  it('returns NOT_FOUND when notification is not found', async () => {
    vi.mocked(prisma.notifications.findFirst).mockResolvedValue(null);

    const result = await getNotificationService('1', 1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.notifications.findFirst).mockRejectedValue(new Error('db cursed'));

    const result = await getNotificationService('1', 1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
