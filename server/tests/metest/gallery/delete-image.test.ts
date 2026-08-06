import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { deleteImageService } from '#services/images/delete-image.ts';
import { deleteGalleryImageService } from '#services/me/gallery/delete-image.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    galleryImages: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const prismaImage = {
  galleryImageId: 1,
  image: 'image.jpg',
  altText: 'A beautiful image',
  position: 1,
  userId: 1,
};

const deletedImage = {
  galleryImageId: 1,
  image: 'image.jpg',
  altText: 'A beautiful image',
  position: 1,
  userId: 1,
};

vi.mock('#services/images/delete-image.ts', () => ({
  deleteImageService: vi.fn(),
}));

describe('deleteGalleryImageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NO_CONTENT when the image is deleted successfully', async () => {
    vi.mocked(prisma.galleryImages.findFirst).mockResolvedValue(prismaImage);
    vi.mocked(prisma.galleryImages.delete).mockResolvedValue(deletedImage);
    vi.mocked(deleteImageService).mockResolvedValue(undefined);

    const result = await deleteGalleryImageService(1, 1);

    expect(result).toBe('NO_CONTENT');
  });

  it('returns NOT_FOUND when image is not found', async () => {
    vi.mocked(prisma.galleryImages.findFirst).mockResolvedValue(null);

    const result = await deleteGalleryImageService(1, 1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.galleryImages.findFirst).mockRejectedValue(new Error('db exploded ;-;'));

    const result = await deleteGalleryImageService(1, 1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
