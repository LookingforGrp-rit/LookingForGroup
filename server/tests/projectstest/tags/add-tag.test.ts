import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import prisma from '#config/prisma.ts';
import addTagService from '#services/projects/tags/add-tag.ts';
import { transformProjectTag } from '#services/transformers/projects/parts/project-tag.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projectTags: {
      create: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/project-tag.ts', () => ({
  transformProjectTag: vi.fn(),
}));

const prismaProjectTag = {
  projectId: 100,
  tagId: 70,
  displayOrder: 0,
  tag: {
    tagId: 70,
    label: 'Test',
    type: 'Developer',
  },
};

describe('addTagsService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (transformProjectTag as Mock).mockImplementation(
      (_projectId: number, { label, tagId, type, displayOrder }) => ({
        apiUrl: '',
        label: label,
        tagId: tagId,
        type: type,
        displayOrder: displayOrder,
      }),
    );
  });
  it("returns the project's tags", async () => {
    vi.mocked(prisma.projectTags.create).mockResolvedValue(prismaProjectTag);
    const result = await addTagService(100, { tagId: 70, displayOrder: 0 });

    expect(result).toStrictEqual({
      apiUrl: '',
      tagId: 70,
      label: 'Test',
      type: 'Developer',
      displayOrder: 0,
    });
  });
  it("returns NOT_FOUND if the tag can't be found", async () => {
    vi.mocked(prisma.projectTags.create).mockRejectedValue({ code: 'P2025' });
    const result = await addTagService(100, { tagId: 70, displayOrder: 0 });

    expect(result).toBe('NOT_FOUND');
  });
  it('returns CONFLICT if the prisma finds a conflict', async () => {
    vi.mocked(prisma.projectTags.create).mockRejectedValue({ code: 'P2002' });
    const result = await addTagService(100, { tagId: 70, displayOrder: 0 });

    expect(result).toBe('CONFLICT');
  });
  it('returns INTERNAL_ERROR if the prisma finds any other error', async () => {
    vi.mocked(prisma.projectTags.create).mockRejectedValue(new Error('womp womp'));
    const result = await addTagService(100, { tagId: 70, displayOrder: 0 });

    expect(result).toBe('INTERNAL_ERROR');
  });
});
