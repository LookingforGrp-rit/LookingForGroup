import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getMediumsService from '#services/datasets/get-mediums.ts';
import { transformMedium } from '#services/transformers/datasets/medium.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    mediums: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/datasets/medium.ts', () => ({
  transformMedium: vi.fn(),
}));

describe('getMediumsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed mediums when found', async () => {
    const prismaMediums = [
      { mediumId: 2, label: 'Analog Game' },
      { mediumId: 1, label: 'Video Game' },
    ];

    vi.mocked(prisma.mediums.findMany).mockResolvedValue(prismaMediums);
    vi.mocked(transformMedium).mockImplementation((medium) => ({ ...medium, transformed: true }));

    const result = await getMediumsService();

    // console.log(result);

    expect(vi.mocked(prisma.mediums.findMany)).toHaveBeenCalled();
    expect(vi.mocked(transformMedium)).toHaveBeenCalledTimes(2);
    expect(result).toEqual([
      { mediumId: 2, label: 'Analog Game', transformed: true },
      { mediumId: 1, label: 'Video Game', transformed: true },
    ]);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.mediums.findMany).mockRejectedValue(new Error('db on fire'));

    const result = await getMediumsService();

    expect(result).toBe('INTERNAL_ERROR');
  });
});
