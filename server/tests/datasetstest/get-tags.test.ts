import type { Tag, TagType } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getTagsService from '#services/datasets/get-tags.ts';
import { transformTag } from '#services/transformers/datasets/tag.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    tags: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/datasets/tag.ts', () => ({
  transformTag: vi.fn(),
}));

describe('getTagsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed tag when found', async () => {
    const prismaTags: Tag[] = [
      { tagId: 1, label: 'Indie', type: 'Creative' as TagType },
      { tagId: 181, label: 'Innovation', type: 'Soft Skill' as TagType },
    ];

    const transformed: Tag[] = [
      { tagId: 1, label: 'Indie', type: 'Creative' as TagType },
      { tagId: 181, label: 'Innovation', type: 'Soft Skill' as TagType },
    ];

    vi.mocked(prisma.tags.findMany).mockResolvedValue(prismaTags);
    vi.mocked(transformTag).mockImplementation((tag) => tag as Tag);

    const result = await getTagsService();

    // console.log(result);

    expect(vi.mocked(prisma.tags.findMany)).toHaveBeenCalled();
    expect(vi.mocked(transformTag)).toHaveBeenCalledTimes(2);
    expect(result).toEqual(transformed);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.tags.findMany).mockRejectedValue(new Error('db on fire'));

    const result = await getTagsService();

    expect(result).toBe('INTERNAL_ERROR');
  });
});
