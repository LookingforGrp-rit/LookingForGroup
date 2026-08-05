import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getGalleryVideosService from '#services/me/gallery/get-videos.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    galleryVideos: {
      findMany: vi.fn(),
    },
  },
}));

const prismaVideos = [
  {
    position: 1,
    userId: 1,
    title: 'Not Rick Roll',
    galleryVideoId: 1,
    videoUrl: 'video.mp4',
  },
  {
    position: 2,
    userId: 1,
    title: 'Yes, Rick Roll. So?',
    galleryVideoId: 2,
    videoUrl: 'video.mp4',
  },
];

describe('getGalleryVideosService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the gallery videos when they are found', async () => {
    vi.mocked(prisma.galleryVideos.findMany).mockResolvedValue(prismaVideos);

    const result = await getGalleryVideosService(1);

    expect(result).toEqual(prismaVideos);
  });

  it('returns an empty array when videos are not found', async () => {
    vi.mocked(prisma.galleryVideos.findMany).mockResolvedValue([]);

    const result = await getGalleryVideosService(1);

    expect(result).toEqual([]);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.galleryVideos.findMany).mockRejectedValue(new Error('db exploded ;-;'));

    const result = await getGalleryVideosService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
