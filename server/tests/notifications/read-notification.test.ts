import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import readNotificationService from '#services/notifications/read-notification.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    notifications: {
      update: vi.fn(),
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

describe('readNotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns OK the notifications when is updated', async () => {
    vi.mocked(prisma.notifications.update).mockResolvedValue(prismaNotification as any);

    const result = await readNotificationService('1', 1);

    expect(result).toBe('OK');
  });

  it('returns NOT_FOUND when notification is not found', async () => {
    vi.mocked(prisma.notifications.update).mockRejectedValue({ code: 'P2025' });

    const result = await readNotificationService('1', 1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.notifications.update).mockRejectedValue(new Error('db cursed'));

    const result = await readNotificationService('1', 1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
