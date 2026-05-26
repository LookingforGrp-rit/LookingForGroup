import type { Social } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getSocialsService from '#services/datasets/get-socials.ts';
import { transformSocial } from '#services/transformers/datasets/social.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    socials: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/datasets/social.ts', () => ({
  transformSocial: vi.fn(),
}));

describe('getSocialsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed social when found', async () => {
    const prismaSocials: Social[] = [
      { websiteId: 1, label: 'Instagram' },
      { websiteId: 2, label: 'Twitter' },
    ];

    const transformed: Social[] = [
      { websiteId: 1, label: 'Instagram' },
      { websiteId: 2, label: 'Twitter' },
    ];

    vi.mocked(prisma.socials.findMany).mockResolvedValue(prismaSocials);
    vi.mocked(transformSocial).mockImplementation((social) => social as Social);

    const result = await getSocialsService();

    // console.log(result);

    expect(vi.mocked(prisma.socials.findMany)).toHaveBeenCalled();
    expect(vi.mocked(transformSocial)).toHaveBeenCalledTimes(2);
    expect(result).toEqual(transformed);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.socials.findMany).mockRejectedValue(new Error('db on fire'));

    const result = await getSocialsService();

    expect(result).toBe('INTERNAL_ERROR');
  });
});
