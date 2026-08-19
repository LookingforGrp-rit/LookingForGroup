import type { AuthenticatedRequest, ModeratorNotificationInput } from '@looking-for-group/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import prisma from '#config/prisma.ts';
import sendBugUpdateService from '#services/mod/notifications/bug-update.ts';
import sendNotificationService from '#services/notifications/send-notification.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    reportBug: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('#services/notifications/send-notification.ts', () => ({
  default: vi.fn(),
}));

const prismaBug = {
  userId: 1,
  createdAt: new Date(),
  reportId: 1,
  reportText: 'A ladybug found in the system.',
  isResolved: true,
  modNotes: 'Bug killed. Please check the update.',
};

const notificationData: ModeratorNotificationInput = {
  modUserId: 1,
  receiverId: 2,
  subjectLine: 'Bug Update',
  message: 'Bug killed. Please check the update.',
  type: 'General',
};

const request = {
  body: notificationData,
  currentUser: { username: 'moderator', userId: 1, accessLevel: 'Moderator' },
} as AuthenticatedRequest;

describe('sendBugUpdateService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendNotificationService).mockResolvedValue('CREATED');
  });

  it('creates a notification and sends the general email', async () => {
    vi.mocked(prisma.reportBug.findUnique).mockResolvedValue(prismaBug);

    const result = await sendBugUpdateService(request);

    expect(result).toBe('CREATED');
    expect(prisma.reportBug.findUnique).toHaveBeenCalledWith({ where: { reportId: 1 } });
    expect(sendNotificationService).toHaveBeenCalledWith(expect.anything(), request);
  });

  it("returns NOT_FOUND without sending a notification when the receiver doesn't exist", async () => {
    vi.mocked(prisma.reportBug.findUnique).mockResolvedValue(null);

    const result = await sendBugUpdateService(request);

    expect(result).toBe('NOT_FOUND');
    expect(sendNotificationService).not.toHaveBeenCalled();
  });

  it('returns the notification service error without sending an email', async () => {
    vi.mocked(prisma.reportBug.findUnique).mockResolvedValue(prismaBug);
    vi.mocked(sendNotificationService).mockResolvedValue('CONFLICT');

    const result = await sendBugUpdateService(request);

    expect(result).toBe('CONFLICT');
  });

  it('returns INTERNAL_ERROR when finding the receiver throws', async () => {
    vi.mocked(prisma.reportBug.findUnique).mockRejectedValue(new Error('db cursed'));

    const result = await sendBugUpdateService(request);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
