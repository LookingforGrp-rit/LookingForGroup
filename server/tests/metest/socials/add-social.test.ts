import type { MySocial } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { addSocialService } from '#services/me/socials/add-social.ts';
import { transformMySocial } from '#services/transformers/me/parts/my-social.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    userSocials: {
      create: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/me/parts/my-social.ts', () => ({
  transformMySocial: vi.fn(),
}));

const prismaSocial = {
  websiteId: 1,
  userId: 1,
  url: '',
  socials: {
    websiteId: 1,
    label: '',
  },
};

const transformed: MySocial = {
  apiUrl: 'api/me/socials/1',
  url: '',
  websiteId: 1,
  label: '',
};

describe('addSocialService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed my social', async () => {
    vi.mocked(prisma.userSocials.create).mockResolvedValue(prismaSocial);
    vi.mocked(transformMySocial).mockReturnValue(transformed);

    const result = await addSocialService({ url: '', websiteId: 1 }, 1);

    expect(result).toBe(transformed);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.userSocials.create).mockRejectedValue(new Error('db cursed'));

    const result = await addSocialService({ url: '', websiteId: 1 }, 1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
