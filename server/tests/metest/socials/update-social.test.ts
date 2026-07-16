import type { MySocial } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { updateSocialService } from '#services/me/socials/update-social.ts';
import { transformMySocial } from '#services/transformers/me/parts/my-social.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    userSocials: {
      update: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/me/parts/my-social.ts', () => ({
  transformMySocial: vi.fn(),
}));

const prismaUserSocial = {
  userId: 1,
  websiteId: 1,
  url: 'old.com',
};

const transformed: MySocial = {
  apiUrl: 'api/me/socials',
  label: '',
  url: 'new.com',
  websiteId: 2,
};

describe('updateSocialService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed my social', async () => {
    vi.mocked(prisma.userSocials.update).mockResolvedValue(prismaUserSocial);
    vi.mocked(transformMySocial).mockReturnValue(transformed);

    const result = await updateSocialService({ websiteId: 2, url: 'new.com' }, 1);

    expect(result).toBe(transformed);
  });

  it('returns NOT_FOUND if website not found', async () => {
    vi.mocked(prisma.userSocials.update).mockRejectedValue({ code: 'P2025' });

    const result = await updateSocialService({ websiteId: 20000, url: 'new.com' }, 1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.userSocials.update).mockRejectedValue(new Error('db cursed'));

    const result = await updateSocialService({ websiteId: 2, url: 'new.com' }, 1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
