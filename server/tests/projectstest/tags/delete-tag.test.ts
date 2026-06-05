import type { ProjectTag, Tag } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { deleteTagService } from '#services/projects/tags/delete-tag.ts';
import getTagsService from '#services/projects/tags/get-proj-tags.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projectTags: {
      delete: vi.fn(),
      update: vi.fn(),
    },
    tags: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/projects/tags/get-proj-tags.ts', () => ({
  default: vi.fn(),
}));

const tag: Tag = {
  tagId: 71,
  label: 'Test 2',
  type: 'Designer',
};

const prismaProjectTag = {
  projectId: 0,
  tagId: 0,
  displayOrder: 0,
};

describe('deleteTagsService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns NO_CONTENT if successful', async () => {
    vi.mocked(prisma.projectTags.delete).mockResolvedValue({
      projectId: 0,
      tagId: 0,
      displayOrder: 0,
    });
    vi.mocked(prisma.projectTags.update).mockResolvedValue(prismaProjectTag);
    vi.mocked(prisma.tags.findMany).mockResolvedValue([tag]);

    vi.mocked(getTagsService).mockResolvedValue([
      { tagId: 71, label: 'Test 2', type: 'Designer', displayOrder: 1 } as ProjectTag,
    ]);

    const result = await deleteTagService(100, 70);

    expect(result).toBe('NO_CONTENT');
  });
  it("returns NOT_FOUND if tag doesn't exist", async () => {
    vi.mocked(prisma.projectTags.delete).mockRejectedValue({ code: 'P2025' });
    const result = await deleteTagService(100, 70);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projectTags.delete).mockRejectedValue(new Error('womp womp'));
    const result = await deleteTagService(100, 70);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
