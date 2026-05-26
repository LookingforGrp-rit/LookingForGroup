import type { MySocial } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { getSocialsService } from '#services/me/socials/get-socials.ts';
import { transformMySocial } from '#services/transformers/me/parts/my-social.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    userSocials: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/me/parts/my-social.ts', () => ({
  transformMySocial: vi.fn(),
}));

const prismaUserSocials = [
  {
    userId: 1,
    label: '',
    url: '',
    websiteId: 1,
  },
];

const transformed: MySocial = {
  apiUrl: 'api/me/socials',
  label: '',
  url: '',
  websiteId: 1,
};

describe('getSocialsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('return transformed my socials', async () => {
    vi.mocked(prisma.userSocials.findMany).mockResolvedValue(prismaUserSocials);
    vi.mocked(transformMySocial).mockReturnValue(transformed);

    const result = await getSocialsService(1);

    expect(result).toStrictEqual([transformed]);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.userSocials.findMany).mockRejectedValue(new Error('db cursed'));

    const result = await getSocialsService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
