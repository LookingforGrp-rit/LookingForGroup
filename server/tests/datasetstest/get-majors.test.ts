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
    const prismaMajor = [
      { majorId: 1, label: 'Animation' },
      { majorId: 2, label: 'Computer Engineering' },
    ];

    vi.mocked(prisma.majors.findMany).mockResolvedValue(prismaMajor as Major[]);
    vi.mocked(transformMajor).mockImplementation((major) => ({ ...major, transformed: true }));

    const result = await getMajorsService();

    // console.log(result);

    expect(vi.mocked(prisma.majors.findMany)).toHaveBeenCalled();
    expect(vi.mocked(transformMajor)).toHaveBeenCalledTimes(2);
    expect(result).toEqual([
      { majorId: 1, label: 'Animation', transformed: true },
      { majorId: 2, label: 'Computer Engineering', transformed: true },
    ]);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.majors.findMany).mockRejectedValue(new Error('db on fire'));

    const result = await getMajorsService();

    expect(result).toBe('INTERNAL_ERROR');
  });
});
