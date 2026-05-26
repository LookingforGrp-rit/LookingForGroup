import type { ProjectStatus, ProjectPurpose, Tag } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import prisma from '#config/prisma.ts';
import addTagService from '#services/projects/tags/add-tags.ts';
import { transformProjectTag } from '#services/transformers/projects/parts/project-tag.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      update: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/project-tag.ts', () => ({
  transformProjectTag: vi.fn(),
}));

const now = new Date();

const tag: Tag = {
  tagId: 70,
  label: 'Test',
  type: 'Developer',
};

const prismaProject = {
  audience: '',
  createdAt: now,
  description: '',
  hook: '',
  projectId: 1,
  purpose: 'Academic' as ProjectPurpose,
  status: 'Planning' as ProjectStatus,
  thumbnailId: 0,
  title: 'test 1',
  tags: [tag],
  updatedAt: now,
  userId: 1,
};

describe('addTagsService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (transformProjectTag as Mock).mockImplementation(
      (projectId: number, { label, tagId, type }) => ({
        projectId: projectId,
        label: label,
        tagId: tagId,
        type: type,
      }),
    );
  });
  it("returns the project's tags", async () => {
    vi.mocked(prisma.projects.update).mockResolvedValue(prismaProject);
    const result = await addTagService(100, { tagId: 70 });

    expect(result).toStrictEqual([
      {
        projectId: 100,
        label: 'Test',
        tagId: 70,
        type: 'Developer',
      },
    ]);
  });
  it("returns NOT_FOUND if the project can't be found", async () => {
    vi.mocked(prisma.projects.update).mockRejectedValue({ code: 'P2025' });
    const result = await addTagService(100, { tagId: 70 });

    expect(result).toBe('NOT_FOUND');
  });
  it('returns CONFLICT if the prisma finds a conflict', async () => {
    vi.mocked(prisma.projects.update).mockRejectedValue({ code: 'P2002' });
    const result = await addTagService(100, { tagId: 70 });

    expect(result).toBe('CONFLICT');
  });
  it('returns INTERNAL_ERROR if the prisma finds any other error', async () => {
    vi.mocked(prisma.projects.update).mockRejectedValue(new Error('womp womp'));
    const result = await addTagService(100, { tagId: 70 });

    expect(result).toBe('INTERNAL_ERROR');
  });
});
