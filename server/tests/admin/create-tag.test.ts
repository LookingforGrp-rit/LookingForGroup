import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { createTagService } from '#services/admin/create-tag.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    tags: {
      create: vi.fn(),
    },
  },
}));

const prismaTag = {
  label: 'Crafting',
  type: 'Genre',
  category: 'Game',
  tagId: 1,
};

describe('createTagService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the tag when tag is created', async () => {
    vi.mocked(prisma.tags.create).mockResolvedValue(prismaTag);

    const result = await createTagService({
      label: 'Crafting',
      type: 'Genre',
      category: 'Game',
    });

    expect(result).toBe(prismaTag);
  });

  it('returns CONFLICT when tag already exists', async () => {
    const error = Object.assign(new Error('Tag already exists'), { code: 'P2002' });
    vi.mocked(prisma.tags.create).mockRejectedValue(error);

    const result = await createTagService({
      label: 'Crafting',
      type: 'Genre',
      category: 'Game',
    });

    expect(result).toBe('CONFLICT');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.tags.create).mockRejectedValue(new Error('db ghosted'));

    const result = await createTagService({
      label: 'Crafting',
      type: 'Genre',
      category: 'Game',
    });

    expect(result).toBe('INTERNAL_ERROR');
  });
});
