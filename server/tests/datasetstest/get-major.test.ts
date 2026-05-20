import type { Major } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getMajorsService from '#services/datasets/get-majors.ts';
import { transformMajor } from '#services/transformers/datasets/major.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    majors: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/datasets/major.ts', () => ({
  transformMajor: vi.fn(),
}));

describe('getMajorsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed majors when found', async () => {
    const prismaMajor = {
      majorId: 1,
      label: 'Animation',
    };

    const transformed: Major = {
      majorId: 1,
      label: 'Animation',
    };

    vi.mocked(prisma.majors.findMany).mockResolvedValue([prismaMajor as Major]);
    vi.mocked(transformMajor).mockReturnValue(transformed);

    const result = await getMajorsService();

    const calls = vi.mocked(prisma.majors.findMany).mock.calls;
    const [args] = calls[0];

    expect(args?.orderBy).toEqual({ label: 'asc' });
    expect(args?.select).toEqual(expect.any(Object));

    expect(vi.mocked(transformMajor).mock.calls[0][0]).toEqual(prismaMajor);

    expect(result).toEqual([transformed]);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.majors.findMany).mockRejectedValue(new Error('db on fire'));

    const result = await getMajorsService();

    expect(result).toBe('INTERNAL_ERROR');
  });
});
