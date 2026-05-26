import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { deleteSocialService } from '#services/me/socials/delete-social.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    userSocials: {
      delete: vi.fn(),
    },
  },
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

describe('deleteSocialService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NO_CONTENT after social deleted', async () => {
    vi.mocked(prisma.userSocials.delete).mockResolvedValue(prismaSocial);

    const result = await deleteSocialService(1, 1);

    expect(result).toBe('NO_CONTENT');
  });

  it('returns NOT_FOUND if user social does not exist', async () => {
    vi.mocked(prisma.userSocials.delete).mockRejectedValue({ code: 'P2025' });

    const result = await deleteSocialService(1, 1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.userSocials.delete).mockRejectedValue(new Error('db cursed'));

    const result = await deleteSocialService(1, 1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
