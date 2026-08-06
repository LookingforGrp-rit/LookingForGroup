import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { deleteTagFromSiteService } from '#services/admin/delete-tag.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    tags: {
      delete: vi.fn(),
    },
  },
}));

const prismaTag = {
  label: 'Crafting',
  type: 'Genre',
  category: 'Game',
  tagId: 1,
};

describe('deleteTagFromSiteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NO_CONTENT when skill is deleted', async () => {
    vi.mocked(prisma.tags.delete).mockResolvedValue(prismaTag);

    const result = await deleteTagFromSiteService(1);

    expect(result).toBe('NO_CONTENT');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.tags.delete).mockRejectedValue(new Error('db ghosted'));

    const result = await deleteTagFromSiteService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
