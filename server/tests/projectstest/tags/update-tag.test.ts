import type { ProjectTag } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import prisma from '#config/prisma.ts';
import getProjectTags from '#services/projects/tags/get-proj-tags.ts';
import updateTagService from '#services/projects/tags/update-tag.ts';
import { transformProjectTag } from '#services/transformers/projects/parts/project-tag.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findUnique: vi.fn(),
    },
    projectTags: {
      update: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/project-tag.ts', () => ({
  transformProjectTag: vi.fn(),
}));

vi.mock('#services/projects/tags/get-proj-tags.ts', () => ({
  default: vi.fn(),
}));

const prismaTags = [
  { tagId: 70, label: 'Test', type: 'Developer', displayOrder: 0, apiUrl: '' },
  { tagId: 71, label: 'Test 2', type: 'Designer', displayOrder: 1, apiUrl: '' },
];

describe('updateTagService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (transformProjectTag as Mock).mockImplementation(
      (projectId: number, { label, tagId, type, displayOrder }) => ({
        projectId,
        label,
        tagId,
        type,
        displayOrder,
      }),
    );
  });
  it('returns the project tags in the new order', async () => {
    vi.mocked(getProjectTags).mockResolvedValue(prismaTags as ProjectTag[]);
    vi.mocked(prisma.projectTags.update).mockResolvedValue({} as any);

    const result = await updateTagService(100, 71, { displayOrder: 0 });

    expect(result).toStrictEqual([
      {
        projectId: 100,
        tagId: 71,
        label: 'Test 2',
        type: 'Designer',
        displayOrder: 0,
      },
      {
        projectId: 100,
        tagId: 70,
        label: 'Test',
        type: 'Developer',
        displayOrder: 1,
      },
    ]);
  });
  it("returns NOT_FOUND if tag isn't found", async () => {
    vi.mocked(getProjectTags).mockRejectedValue({ code: 'P2025' });
    const result = await updateTagService(100, 71, { displayOrder: 0 });

    expect(result).toBe('NOT_FOUND');
  });

  it('returns CONFLICT if tag is already in use', async () => {
    vi.mocked(getProjectTags).mockRejectedValue({ code: 'P2002' });
    const result = await updateTagService(100, 71, { displayOrder: 0 });

    expect(result).toBe('CONFLICT');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(getProjectTags).mockRejectedValue(prismaTags);
    vi.mocked(prisma.projectTags.update).mockRejectedValue(new Error('womp womp'));

    const result = await updateTagService(100, 71, { displayOrder: 0 });

    expect(result).toBe('INTERNAL_ERROR');
  });
});
