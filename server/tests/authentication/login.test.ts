import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { loginService } from '#services/authentication/login.ts';
import userOnBlacklistService from '#services/users/blacklist/user-on-blacklist.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

const verifyIdTokenMock = vi.fn();

vi.mock('google-auth-library', () => ({
  OAuth2Client: class {
    verifyIdToken = verifyIdTokenMock;
  },
}));

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('#services/users/blacklist/user-on-blacklist.ts', () => ({
  default: vi.fn(),
}));

const token = 'fake-token';
const payload = {
  email: 'ece8433@rit.edu',
  sub: 'g123',
  given_name: 'Eric',
  family_name: 'E',
};

const existingUser = {
  firstName: 'Existing',
  lastName: 'User',
  ritEmail: 'existing@rit.edu',
  googleId: 'g123',
};

const newUserPayload = {
  email: 'new@rit.edu',
  sub: 'g999',
  given_name: 'New',
  family_name: 'User',
};

describe('loginService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns user data when an existing user is found', async () => {
    verifyIdTokenMock.mockResolvedValue({
      getPayload: () => payload,
    });
    vi.mocked(userOnBlacklistService).mockResolvedValue('NOT_FOUND');
    vi.mocked(prisma.users.findFirst).mockResolvedValue(existingUser as any);

    const result = await loginService(token);

    expect(result).toStrictEqual({
      firstName: 'Existing',
      lastName: 'User',
      email: 'existing@rit.edu',
      googleId: 'g123',
      userExists: true,
    });
  });

  it('returns user data for a new user', async () => {
    verifyIdTokenMock.mockResolvedValue({
      getPayload: () => newUserPayload,
    });
    vi.mocked(userOnBlacklistService).mockResolvedValue('NOT_FOUND');
    vi.mocked(prisma.users.findFirst).mockResolvedValue(null);

    const result = await loginService(token);

    expect(result).toStrictEqual({
      firstName: 'New',
      lastName: 'User',
      email: 'new@rit.edu',
      googleId: 'g999',
      userExists: false,
    });
  });

  it('returns BAD_REQUEST for an invalid email', async () => {
    verifyIdTokenMock.mockResolvedValue({
      getPayload: () => ({ email: 'invalid@example.com', sub: 'g123' }),
    });
    vi.mocked(userOnBlacklistService).mockResolvedValue('NOT_FOUND');

    const result = await loginService(token);

    expect(result).toBe('BAD_REQUEST');
  });

  it('returns FORBIDDEN when the user is blacklisted', async () => {
    verifyIdTokenMock.mockResolvedValue({
      getPayload: () => payload,
    });
    vi.mocked(userOnBlacklistService).mockResolvedValue('OK');

    const result = await loginService(token);

    expect(result).toBe('FORBIDDEN');
  });
});
