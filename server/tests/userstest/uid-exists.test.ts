import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Users } from '#prisma-models/index.js';
import uidExistsService from '#services/users/uid-exists.ts';
//import { Users } from '@prisma/client';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findUnique: vi.fn(),
    },
  },
}));

describe('uidExists test service,', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when the user exists', async () => {
    const mockUser: Users = {
      userId: 1,
      username: 'real_user',
      ritEmail: 'real@rit.edu',
      firstName: 'Real',
      lastName: 'User',
      profileImage: null,
      headline: 'Testing',
      pronouns: 'they/them',
      title: 'Student',
      academicYear: null,
      mentor: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      universityId: '1',
      location: '',
      funFact: '',
      bio: '',
      visibility: 0,
      phoneNumber: null,
    };

    const result = await uidExistsService(1);

    expect(vi.mocked(prisma.users.findUnique)).toHaveBeenCalledWith({
      where: { userId: 1 },
    });
    expect(result).toBe(true);
  });

  it('returns false when the user doesnt exist', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(null);

    const result = await uidExistsService(999);

    expect(result).toBe(false);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.users.findUnique).mockRejectedValue(new Error('db is tired'));

    const result = await uidExistsService(5);
    expect(result).toBe('INTERNAL_ERROR');
  });
});
