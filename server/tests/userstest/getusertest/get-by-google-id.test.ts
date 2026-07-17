import type { UserDetail } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { transformUserToDetail } from '#services/transformers/users/user-detail.ts';
import { getUserByGoogleIdService } from '#services/users/get-user/get-by-google-id.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findUnique: vi.fn(),
    },
    skills: {
      findMany: vi.fn(),
    },
    socials: {
      findMany: vi.fn(),
    },
    projectImages: {
      findMany: vi.fn(),
    },
    mediums: {
      findMany: vi.fn(),
    },
    tags: {
      findMany: vi.fn(),
    },
    projects: {
      findMany: vi.fn(),
    },
    projectsAwaitingApproval: {
      findMany: vi.fn(),
    },
    roles: {
      findMany: vi.fn(),
    },
    members: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/users/user-detail.ts', () => ({
  transformUserToDetail: vi.fn(),
}));

describe('getUserByUsernameService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed user when found', async () => {
    const prismaUser = {
      userId: 3,
      username: 'emberfox',
      googleId: '300',
    };

    const transformed: UserDetail = {
      userId: 3,
      username: 'emberfox',
      apiUrl: '/api/users/3',
    } as UserDetail;

    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser as any);
    vi.mocked(transformUserToDetail).mockReturnValue(transformed);

    const result = await getUserByGoogleIdService('300');

    const calls = vi.mocked(prisma.users.findUnique).mock.calls;
    const [args] = calls[0];

    expect(args.where).toEqual({ googleId: '300' });
    expect(args.select).toBeTypeOf('object');

    expect(transformUserToDetail).toHaveBeenCalledWith(prismaUser);

    expect(result).toEqual(transformed);
  });

  it('returns NOT_FOUND when user does not exist', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(null);
    const result = await getUserByGoogleIdService('300');
    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.users.findUnique).mockRejectedValue(new Error('db exploded'));

    const result = await getUserByGoogleIdService('300');

    expect(result).toBe('INTERNAL_ERROR');
  });
});
