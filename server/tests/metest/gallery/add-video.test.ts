import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import addGalleryVideoService from '#services/me/gallery/add-video.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    galleryVideos: {
      create: vi.fn(),
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

describe('addGalleryVideoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns CREATED when the video is added successfully', async () => {
    vi.mocked(prisma.galleryVideos.create).mockResolvedValue(prismaVideo);

    const result = await addGalleryVideoService({
      videoUrl: 'video.mp4',
      title: 'Not Rick Roll',
      position: 1,
      user: { connect: { userId: 1 } },
    });

    expect(result).toBe('CREATED');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.galleryVideos.create).mockRejectedValue(new Error('db cursed'));

    const result = await addGalleryVideoService({
      videoUrl: 'video.mp4',
      title: 'Not Rick Roll',
      position: 1,
      user: { connect: { userId: 1 } },
    });

    expect(result).toBe('INTERNAL_ERROR');
  });
});
