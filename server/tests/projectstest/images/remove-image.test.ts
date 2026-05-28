import type { ProjectPurpose, ProjectStatus } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { removeImageService } from '#services/projects/images/remove-image.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */

const deletedImage = {
  image: 'www.test.com',
  altText: 'test image',
  position: 3,
  projectId: 1,
  imageId: 4,
};

const now = new Date();

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
  updatedAt: now,
  userId: 1,
};

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    projectImages: {
      delete: vi.fn(),
    },
  },
}));

vi.mock('#services/images/delete-image.ts', () => ({
  deleteImageService: vi.fn(),
}));

describe('removeImageService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns NO_CONTENT if successful', async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject);
    vi.mocked(prisma.projectImages.delete).mockResolvedValue(deletedImage);
    const result = await removeImageService(1, 0);

    expect(prisma.projects.update).toBeCalled();
    expect(result).toBe('NO_CONTENT');
  });

  it("returns NOT_FOUND if project doesn't exist", async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.projectImages.delete).mockResolvedValue(deletedImage);
    const result = await removeImageService(1, 0);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projects.findUnique).mockRejectedValue(new Error('womp womp'));
    vi.mocked(prisma.projectImages.delete).mockResolvedValue(deletedImage);
    const result = await removeImageService(1, 0);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
