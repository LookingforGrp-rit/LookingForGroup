import type { ProjectStatus, ProjectPurpose, Tag } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { deleteTagService } from '#services/projects/tags/delete-tag.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      update: vi.fn(),
    },
  },
}));

const now = new Date();

const tag: Tag = {
  tagId: 71,
  label: 'Test 2',
  type: 'Designer',
};

const prismaProjectRemovedTag = {
  audience: '',
  createdAt: now,
  description: '',
  hook: '',
  projectId: 100,
  purpose: 'Academic' as ProjectPurpose,
  status: 'Planning' as ProjectStatus,
  thumbnailId: null,
  title: 'test 1',
  updatedAt: now,
  userId: 1,
  tags: [tag],
};

describe('deleteTagsService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns NO_CONTENT if successful', async () => {
    vi.mocked(prisma.projects.update).mockResolvedValue(prismaProjectRemovedTag);
    const result = await deleteTagService(100, 70);

    expect(result).toBe('NO_CONTENT');
  });
  it("returns NOT_FOUND if tag doesn't exist", async () => {
    vi.mocked(prisma.projects.update).mockRejectedValue({ code: 'P2025' });
    const result = await deleteTagService(100, 70);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projects.update).mockRejectedValue(new Error('womp womp'));
    const result = await deleteTagService(100, 70);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
