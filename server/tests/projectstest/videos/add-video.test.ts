import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import { unapproveProjectService } from '#services/projects/approval/unapprove-project.ts';
import addVideoService from '#services/projects/videos/add-video.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

const videoData: Prisma.ProjectVideosCreateInput = {
  videoUrl: 'www.test.com',
  title: 'test video',
  position: 3,
  projects: {
    connect: {
      projectId: 1,
    },
  },
};

const prismaVideo = {
  videoUrl: 'www.test.com',
  title: 'test image',
  position: 3,
  projectId: 1,
  videoId: 4,
};

const approvedProject = {
  projectId: 1,
  approved: true,
};

const unapprovedProject = {
  projectId: 1,
  approved: false,
};

vi.mock('#config/prisma.ts', () => ({
  default: {
    projectVideos: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    projects: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('#services/projects/approval/unapprove-project.ts', () => ({
  unapproveProjectService: vi.fn(),
}));

describe('addVideoService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns CREATED if successfully created the project and unapproves approved project', async () => {
    vi.mocked(prisma.projectVideos.create).mockResolvedValue(prismaVideo);
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(approvedProject as any);
    vi.mocked(unapproveProjectService).mockResolvedValue(unapprovedProject as any);

    const result = await addVideoService(videoData);

    expect(result).toBe('CREATED');
  });

  it('returns CREATED if successfully created the project and do not unapprove a not-approved project', async () => {
    vi.mocked(prisma.projectVideos.create).mockResolvedValue(prismaVideo);
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(unapprovedProject as any);

    const result = await addVideoService(videoData);

    expect(result).toBe('CREATED');
  });

  it('returns NOT_FOUND if prisma throws', async () => {
    vi.mocked(prisma.projectVideos.create).mockRejectedValue({ code: 'P2025' });
    const result = await addVideoService(videoData);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projectVideos.create).mockRejectedValue(new Error('womp womp'));
    const result = await addVideoService(videoData);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
