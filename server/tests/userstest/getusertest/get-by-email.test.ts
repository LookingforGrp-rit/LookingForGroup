import type { UserPreview } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';
import { getUserByEmailService } from '#services/users/get-user/get-by-email.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/users/user-preview.ts', () => ({
  transformUserToPreview: vi.fn(),
}));

describe('getUserByEmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed user when found', async () => {
    const prismaUser = {
      userId: 1,
      username: 'goldleaf',
      ritEmail: 'gold@rit.edu',
    };

    const transformed: UserPreview = {
      userId: 1,
      username: 'goldleaf',
      apiUrl: '/api/users/1',
      firstName: '',
      lastName: '',
      profileImage: null,
      mentor: false,
      designer: false,
      developer: false,
      headline: '',
      pronouns: '',
      title: '',
      funFact: '',
      location: '',
      majors: [],
    };

    vi.mocked(prisma.users.findFirst).mockResolvedValue(prismaUser as any);
    vi.mocked(transformUserToPreview).mockReturnValue(transformed);

    const result = await getUserByEmailService('gold@rit.edu');

    const calls = vi.mocked(prisma.users.findFirst).mock.calls;
    const [args] = calls[0];

    expect(args?.where).toEqual({ ritEmail: 'gold@rit.edu' });
    expect(args?.select).toEqual(expect.any(Object));

    expect(transformUserToPreview).toHaveBeenCalledWith(prismaUser);

    expect(result).toEqual(transformed);
  });

  it('returns NOT_FOUND when user does not exist', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue(null);

    const result = await getUserByEmailService('nobody@rit.edu');

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INSTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.users.findFirst).mockRejectedValue(new Error('db on fire'));

    const result = await getUserByEmailService('boom@rit.edu');

    expect(result).toBe('INTERNAL_ERROR');
  });
});
