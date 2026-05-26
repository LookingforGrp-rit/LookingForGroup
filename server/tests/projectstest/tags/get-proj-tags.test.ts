import type { ProjectPurpose, ProjectStatus, Tag } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import prisma from '#config/prisma.ts';
import getProjectTagsService from '#services/projects/tags/get-proj-tags.ts';
import { transformProjectTag } from '#services/transformers/projects/parts/project-tag.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

vi.mock('#services/transformers/projects/parts/project-tag.ts', () => ({
  transformProjectTag: vi.fn(),
}));

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findUnique: vi.fn(),
    },
    tags: {
      findMany: vi.fn(),
    },
  },
}));

const now = new Date();

const tag1: Tag = {
  tagId: 70,
  label: 'Test',
  type: 'Developer',
};
const tag2: Tag = {
  tagId: 71,
  label: 'Test 2',
  type: 'Designer',
};
const prismaProject = {
  audience: '',
  createdAt: now,
  description: '',
  hook: '',
  projectId: 100,
  purpose: 'Academic' as ProjectPurpose,
  status: 'Planning' as ProjectStatus,
  thumbnailId: 0,
  title: 'test 1',
  updatedAt: now,
  userId: 1,
  tags: [tag1, tag2],
};

describe('getProjectTagsService', async () => {
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
  it('Get all tags of a project', async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject);
    const result = await getProjectTagsService(1);

    expect(transformProjectTag).toBeCalled();
    expect(transformProjectTag).toBeCalledTimes(2);
    expect(result).toStrictEqual([
      {
        label: 'Test',
        projectId: 1,
        tagId: 70,
        type: 'Developer',
      },
      {
        label: 'Test 2',
        projectId: 1,
        tagId: 71,
        type: 'Designer',
      },
    ]);
  });
  it("returns NOT_FOUND if project isn't found", async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(null);
    const result = await getProjectTagsService(1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projects.findUnique).mockRejectedValue(new Error('womp womp'));
    const result = await getProjectTagsService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
