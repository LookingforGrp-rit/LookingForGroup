import type { ProjectImage, ProjectStatus, ProjectPurpose } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Projects } from '#prisma-models/index.js';
import updateThumbnailService from '#services/projects/thumbnail/update-thumbnail.ts';
import { transformProjectImage } from '#services/transformers/projects/parts/project-image.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      update: vi.fn(),
    },
    projectImages: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/project-image.ts', () => ({
  transformProjectImage: vi.fn(),
}));

const now = new Date();

const prismaProject: Projects = {
  audience: '',
  createdAt: now,
  description: '',
  hook: '',
  projectId: 100,
  purpose: 'Academic' as ProjectPurpose,
  status: 'Planning' as ProjectStatus,
  thumbnailId: 8,
  title: 'test 1',
  updatedAt: now,
  userId: 1,
};

const thumbImage = {
  imageId: 8,
  projectId: 100,
  position: 1,
  image: 'test.png',
  altText: 'A test thumbnail',
};

const transformedThumb: ProjectImage = {
  imageId: 8,
  image: 'test.png',
  altText: 'A test thumbnail',
  apiUrl: 'api/projects/100/thumbnail',
};

describe('updateThumbnailService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns thumbnail if possible', async () => {
    vi.mocked(prisma.projectImages.findUnique).mockResolvedValue(thumbImage);
    vi.mocked(prisma.projects.update).mockResolvedValue(prismaProject);
    vi.mocked(transformProjectImage).mockReturnValue(transformedThumb);
    const result = await updateThumbnailService(100, 8);

    expect(transformProjectImage).toBeCalled();
    expect(transformProjectImage).toBeCalledWith(100, thumbImage);
    expect(result).toBe(transformedThumb);
  });
  it("returns NOT_FOUND if image doesn't exist", async () => {
    vi.mocked(prisma.projectImages.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.projects.update).mockResolvedValue(prismaProject);
    vi.mocked(transformProjectImage).mockReturnValue(transformedThumb);
    const result = await updateThumbnailService(100, 8);

    expect(result).toBe('NOT_FOUND');
  });
  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projectImages.findUnique).mockRejectedValue(new Error('womp womp'));
    vi.mocked(prisma.projects.update).mockResolvedValue(prismaProject);
    vi.mocked(transformProjectImage).mockReturnValue(transformedThumb);
    const result = await updateThumbnailService(100, 8);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
