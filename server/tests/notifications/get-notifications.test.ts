import type { NotificationPreview } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getNotificationsService from '#services/notifications/get-notifications.ts';
import { transformNotificationToPreview } from '#services/transformers/notifications/notification-preview.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

vi.mock('#config/prisma.ts', () => ({
  default: {
    notifications: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/notifications/notification-preview.ts', () => ({
  transformNotificationToPreview: vi.fn(),
}));

const now = new Date();

const prismaNotifications = [
  {
    notificationId: 1,
    receiverId: 1,
    subjectLine: 'Test Notification',
    message: 'This is a test notification.',
    hasBeenRead: false,
    timeSent: now,
    isGlobal: false,
  },
  {
    notificationId: 2,
    receiverId: 1,
    subjectLine: 'Test Global Notification',
    message: 'This is a test global notification.',
    hasBeenRead: false,
    timeSent: now,
    isGlobal: true,
  },
];

const transformed = [
  {
    notificationId: 1,
    subjectLine: 'Test Notification',
    hasBeenRead: false,
    timeSent: now,
  },
  {
    notificationId: 2,
    subjectLine: 'Test Global Notification',
    hasBeenRead: false,
    timeSent: now,
  },
];

describe('getNotificationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(transformNotificationToPreview).mockImplementation(
      (notification: any): NotificationPreview => ({
        notificationId: notification.notificationId,
        subjectLine: notification.subjectLine,
        hasBeenRead: notification.hasBeenRead,
        timeSent: notification.timeSent,
      }),
    );
  });

  it('returns the notifications when found', async () => {
    vi.mocked(prisma.notifications.findMany).mockResolvedValue(prismaNotifications as any);

    const result = await getNotificationsService(1);

    expect(result).toStrictEqual(transformed);
  });

  it('returns an empty array when notifications are not found', async () => {
    vi.mocked(prisma.notifications.findMany).mockResolvedValue([]);

    const result = await getNotificationsService(1);

    expect(result).toStrictEqual([]);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.notifications.findMany).mockRejectedValue(new Error('db cursed'));

    const result = await getNotificationsService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
