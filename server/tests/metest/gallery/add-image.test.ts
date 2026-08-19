import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import addGalleryImageService from '#services/me/gallery/add-image.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    galleryImages: {
      create: vi.fn(),
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

describe('addGalleryImageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the added image when successful', async () => {
    vi.mocked(prisma.galleryImages.create).mockResolvedValue(prismaImage);

    const result = await addGalleryImageService({
      image: 'image.jpg',
      altText: 'A beautiful image',
      position: 1,
      user: { connect: { userId: 1 } },
    });

    expect(result).toStrictEqual(prismaImage);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.galleryImages.create).mockRejectedValue(new Error('db cursed'));

    const result = await addGalleryImageService({
      image: 'image.jpg',
      altText: 'A beautiful image',
      position: 1,
      user: { connect: { userId: 1 } },
    });

    expect(result).toBe('INTERNAL_ERROR');
  });
});
