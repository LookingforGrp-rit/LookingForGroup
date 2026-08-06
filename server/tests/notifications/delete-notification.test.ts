import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import deleteNotificationService from '#services/notifications/delete-notification.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    notifications: {
      delete: vi.fn(),
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

describe('deleteNotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns OK when notification is deleted', async () => {
    vi.mocked(prisma.notifications.delete).mockResolvedValue(prismaNotification as any);

    const result = await deleteNotificationService('1', 1);

    expect(result).toBe('OK');
  });

  it('returns NOT_FOUND when notification is not found', async () => {
    const error = Object.assign(new Error('notification not found'), { code: 'P2025' });
    vi.mocked(prisma.notifications.delete).mockRejectedValue(error);

    const result = await deleteNotificationService('1', 1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.notifications.delete).mockRejectedValue(new Error('db cursed'));

    const result = await deleteNotificationService('1', 1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
