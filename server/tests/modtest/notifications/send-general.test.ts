import type { AuthenticatedRequest, ModeratorNotificationInput } from '@looking-for-group/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Users } from '#prisma-models/index.js';
// import { sendEmail } from '#services/mailer.ts';
import sendGeneralService from '#services/mod/notifications/send-general.ts';
import sendNotificationService from '#services/notifications/send-notification.ts';

/* eslint-disable @typescript-eslint/unbound-method */

// !! the email part is commented out in the service
// !! uncomment the email test code if we decide to bring it back

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findUnique: vi.fn(),
    },
  },
}));

// vi.mock('#services/mailer.ts', () => ({
//   sendEmail: vi.fn(),
// }));

vi.mock('#services/notifications/send-notification.ts', () => ({
  default: vi.fn(),
}));

const prismaUser: Users = {
  userId: 2,
  googleId: 'u123',
  username: 'goldleaf',
  firstName: 'Gold',
  lastName: 'Leaf',
  ritEmail: 'goldleaf@rit.edu',
  profileImage: null,
  headline: '',
  pronouns: '',
  title: '',
  ritStatus: null,
  mentor: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  displayPhone: false,
  location: '',
  bio: '',
  privacy: 'public',
  phoneNumber: null,
  accessLevel: 'User',
};

const notificationData: ModeratorNotificationInput = {
  modUserId: 1,
  receiverId: 2,
  subjectLine: 'Community update',
  message: 'The event starts at 7 PM.',
  type: 'General',
};

const request = {
  body: notificationData,
  currentUser: { username: 'moderator', userId: 1, accessLevel: 'Moderator' },
} as AuthenticatedRequest;

describe('sendGeneralService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendNotificationService).mockResolvedValue('CREATED');
    // vi.mocked(sendEmail).mockResolvedValue('NO_CONTENT');
  });

  it('creates a notification and sends the general email', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);

    const result = await sendGeneralService(request);

    expect(result).toBe('CREATED');
    expect(prisma.users.findUnique).toHaveBeenCalledWith({ where: { userId: 2 } });
    expect(sendNotificationService).toHaveBeenCalledWith(expect.anything(), request);
    // expect(sendEmail).toHaveBeenCalledOnce();
    // const email = vi.mocked(sendEmail).mock.calls[0][0];

    // expect(email.sender.ritEmail).toBe('lfg-team@lookingforgrp.com');
    // expect(email.sender.firstName).toBe('Looking For Group');
    // expect(email.receiver).toBe(prismaUser);
    // expect(email.subject).toBe(notificationData.subjectLine);
    // expect(email.textBody).toContain(notificationData.message);
    // expect(email.HTMLBody).toContain(notificationData.message);
  });

  it("returns NOT_FOUND without sending a notification when the receiver doesn't exist", async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(null);

    const result = await sendGeneralService(request);

    expect(result).toBe('NOT_FOUND');
    expect(sendNotificationService).not.toHaveBeenCalled();
    // expect(sendEmail).not.toHaveBeenCalled();
  });

  it('returns the notification service error without sending an email', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    vi.mocked(sendNotificationService).mockResolvedValue('CONFLICT');

    const result = await sendGeneralService(request);

    expect(result).toBe('CONFLICT');
    // expect(sendEmail).not.toHaveBeenCalled();
  });

  // !! remove .skip if email is put back
  it.skip('returns INTERNAL_ERROR when email delivery fails', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    // vi.mocked(sendEmail).mockResolvedValue('INTERNAL_ERROR');

    const result = await sendGeneralService(request);

    expect(result).toBe('INTERNAL_ERROR');
  });

  it('returns INTERNAL_ERROR when finding the receiver throws', async () => {
    vi.mocked(prisma.users.findUnique).mockRejectedValue(new Error('db cursed'));

    const result = await sendGeneralService(request);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
