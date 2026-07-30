import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Projects } from '#prisma-models/index.js';
import { removeThumbnailService } from '#services/projects/thumbnail/remove-thumbnail.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const now = new Date();

const prismaProject: Projects = {
  audience: '',
  createdAt: now,
  description: '',
  hook: '',
  projectId: 100,
  context: 'Academic',
  status: 'Planning',
  globalVisibility: 'public',
  thumbnailId: 8,
  title: 'test 1',
  updatedAt: now,
  userId: 1,
  approved: true,
};

const prismaProjectNoThumb: Projects = {
  audience: '',
  createdAt: now,
  description: '',
  hook: '',
  projectId: 100,
  context: 'Academic',
  status: 'Planning',
  globalVisibility: 'public',
  thumbnailId: null,
  title: 'test 1',
  updatedAt: now,
  userId: 1,
  approved: true,
};

describe('removeThumbnailService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns NO_CONTENT if successful', async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject);
    vi.mocked(prisma.projects.update).mockResolvedValue(prismaProjectNoThumb);
    const result = await removeThumbnailService(100);

    expect(result).toBe('NO_CONTENT');
  });

  it("returns NOT_FOUND if project doesn't exist", async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.projects.update).mockResolvedValue(prismaProjectNoThumb);
    const result = await removeThumbnailService(100);

    expect(result).toBe('NOT_FOUND');
  });
  it("returns NOT_FOUND if thumbnail doesn't exist", async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProjectNoThumb);
    vi.mocked(prisma.projects.update).mockResolvedValue(prismaProjectNoThumb);
    const result = await removeThumbnailService(100);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projects.findUnique).mockRejectedValue(new Error('womp womp'));
    vi.mocked(prisma.projects.update).mockResolvedValue(prismaProjectNoThumb);
    const result = await removeThumbnailService(100);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
