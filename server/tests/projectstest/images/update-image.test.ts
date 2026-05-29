import type { ProjectImage } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import updateImageService from '#services/projects/images/update-image.ts';
import { transformProjectImage } from '#services/transformers/projects/parts/project-image.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */

const changes = {
  altText: 'test image new',
};

const prismaImage = {
  image: 'www.test.com',
  altText: 'test image',
  position: 3,
  projectId: 1,
  imageId: 4,
};

const updatedImage = {
  image: 'www.test.com',
  altText: 'test image new',
  position: 3,
  projectId: 1,
  imageId: 4,
};

const transformedImage: ProjectImage = {
  image: 'www.test.com',
  altText: 'test image',
  imageId: 4,
  apiUrl: 'api/projects/1/images/4',
};

vi.mock('#config/prisma.ts', () => ({
  default: {
    projectImages: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/project-image.ts', () => ({
  transformProjectImage: vi.fn(),
}));

describe('updateImageService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns the image if successful', async () => {
    vi.mocked(prisma.projectImages.findUnique).mockResolvedValue(prismaImage);
    vi.mocked(prisma.projectImages.update).mockResolvedValue(updatedImage);
    vi.mocked(transformProjectImage).mockResolvedValue(transformedImage);
    const result = await updateImageService(4, changes);

    expect(result).toBe(transformedImage);
  });

  it("returns NOT_FOUND if image isn't found", async () => {
    vi.mocked(prisma.projectImages.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.projectImages.update).mockResolvedValue(updatedImage);
    vi.mocked(transformProjectImage).mockResolvedValue(transformedImage);
    const result = await updateImageService(4, changes);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projectImages.findUnique).mockRejectedValue(new Error('womp womp'));
    vi.mocked(prisma.projectImages.update).mockResolvedValue(updatedImage);
    vi.mocked(transformProjectImage).mockResolvedValue(transformedImage);
    const result = await updateImageService(4, changes);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
