import type { MyMajor, Major } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getUserMajorsService from '#services/me/majors/get-majors.ts';
import { transformMyMajor } from '#services/transformers/me/parts/my-major.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findUnique: vi.fn(),
    },
    majors: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/me/parts/my-major.ts', () => ({
  transformMyMajor: vi.fn(),
}));

describe('getUserMajorsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed major when found', async () => {
    const prismaMajor: Major = {
      majorId: 1,
      label: 'Animation',
    };

    const transformed: MyMajor = {
      majorId: 1,
      label: 'Animation',
      apiUrl: 'api/me/major',
    };

    vi.mocked(prisma.users.findUnique).mockResolvedValue({
      userId: 1,
      majors: [prismaMajor],
    } as any);
    vi.mocked(transformMyMajor).mockReturnValue(transformed);

    const result = await getUserMajorsService(1);

    const userFindCall = vi.mocked(prisma.users.findUnique).mock.calls[0][0];

    expect(userFindCall.where).toEqual({ userId: 1 });
    expect(userFindCall.include).toEqual(expect.any(Object));

    expect(transformMyMajor).toHaveBeenCalledWith(prismaMajor);
    expect(result).toEqual([transformed]);
  });

  it('returns NOT_FOUND when major does not exist', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(null);
    const result = await getUserMajorsService(999);
    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.users.findUnique).mockRejectedValue(new Error('db cursed'));

    const result = await getUserMajorsService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
