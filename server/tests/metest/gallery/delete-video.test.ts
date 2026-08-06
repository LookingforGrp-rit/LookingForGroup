import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import deleteGalleryVideoService from '#services/me/gallery/delete-video.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    galleryVideos: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const prismaVideo = {
  position: 1,
  userId: 1,
  title: 'Not Rick Roll',
  galleryVideoId: 1,
  videoUrl: 'video.mp4',
};

const deletedVideo = {
  position: 1,
  userId: 1,
  title: 'Not Rick Roll',
  galleryVideoId: 1,
  videoUrl: 'video.mp4',
};

describe('deleteGalleryVideoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NO_CONTENT when the video is deleted successfully', async () => {
    vi.mocked(prisma.galleryVideos.findFirst).mockResolvedValue(prismaVideo);
    vi.mocked(prisma.galleryVideos.delete).mockResolvedValue(deletedVideo);

    const result = await deleteGalleryVideoService(1, 1);

    expect(result).toBe('NO_CONTENT');
  });

  it('returns NOT_FOUND when video is not found', async () => {
    vi.mocked(prisma.galleryVideos.findFirst).mockResolvedValue(null);

    const result = await deleteGalleryVideoService(1, 1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.galleryVideos.findFirst).mockRejectedValue(new Error('db exploded ;-;'));

    const result = await deleteGalleryVideoService(1, 1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
