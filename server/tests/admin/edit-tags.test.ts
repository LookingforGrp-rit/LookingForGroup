import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { editTagService } from '#services/admin/edit-tag.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    tags: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const prismaTag = {
  label: 'Crafting',
  type: 'Genre',
  category: 'Game',
  tagId: 1,
};

const returnedTag = {
  label: 'Simulation',
  type: 'Genre',
  category: 'Game',
  tagId: 1,
};

describe('editTagService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the skill when tag is created', async () => {
    vi.mocked(prisma.tags.findFirst).mockResolvedValue(prismaTag);
    vi.mocked(prisma.tags.update).mockResolvedValue(returnedTag);

    const result = await editTagService({
      tagId: 1,
      label: 'Simulation',
    });

    expect(result).toBe(returnedTag);
  });

  it('returns NOT_FOUND when tag does not exists', async () => {
    vi.mocked(prisma.tags.findFirst).mockResolvedValue(null);

    const result = await editTagService({
      tagId: 1,
      label: 'Simulation',
    });

    expect(result).toBe('NOT_FOUND');
  });

  it('returns CONFLICT when tag conflicts', async () => {
    const error = Object.assign(new Error('Tag conflicts'), { code: 'P2002' });
    vi.mocked(prisma.tags.findFirst).mockRejectedValue(error);

    const result = await editTagService({
      tagId: 1,
      label: 'Simulation',
    });

    expect(result).toBe('CONFLICT');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.tags.findFirst).mockResolvedValue(prismaTag);
    vi.mocked(prisma.tags.update).mockRejectedValue(new Error('db ghosted'));

    const result = await editTagService({
      tagId: 1,
      label: 'Simulation',
    });

    expect(result).toBe('INTERNAL_ERROR');
  });
});
