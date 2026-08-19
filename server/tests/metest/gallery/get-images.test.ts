import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getGalleryImagesService from '#services/me/gallery/get-images.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    galleryImages: {
      findMany: vi.fn(),
    },
  },
}));

const prismaImages = [
  {
    galleryImageId: 1,
    image: 'image.jpg',
    altText: 'A beautiful image',
    position: 1,
    userId: 1,
  },
  {
    galleryImageId: 2,
    image: 'image2.jpg',
    altText: 'A not-so-beautiful image',
    position: 2,
    userId: 1,
  },
];

describe('getGalleryImagesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the gallery images when they are found', async () => {
    vi.mocked(prisma.galleryImages.findMany).mockResolvedValue(prismaImages);

    const result = await getGalleryImagesService(1);

    expect(result).toEqual(prismaImages);
  });

  it('returns an empty array when images are not found', async () => {
    vi.mocked(prisma.galleryImages.findMany).mockResolvedValue([]);

    const result = await getGalleryImagesService(1);

    expect(result).toEqual([]);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.galleryImages.findMany).mockRejectedValue(new Error('db exploded ;-;'));

    const result = await getGalleryImagesService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
