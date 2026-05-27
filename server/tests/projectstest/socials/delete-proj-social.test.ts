import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { deleteProjectSocialService } from '#services/projects/socials/delete-proj-social.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projectSocials: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('deleteProjectSocialService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NO_CONTENT when add is successful', async () => {
    vi.mocked(prisma.projectSocials.findFirst).mockResolvedValue({
      websiteId: 29,
      projectId: 1,
      url: 'www.test.com',
    });
    const result = await deleteProjectSocialService(29, 1);

    expect(result).toBe('NO_CONTENT');
  });

  it("returns NOT_FOUND when the social doesn't exist", async () => {
    vi.mocked(prisma.projectSocials.findFirst).mockResolvedValue(null);
    const result = await deleteProjectSocialService(29, 1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.projectSocials.findFirst).mockRejectedValue(new Error('womp womp'));
    const result = await deleteProjectSocialService(29, 1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
