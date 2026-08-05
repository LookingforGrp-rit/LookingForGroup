import type { ProjectImage, ProjectStatus, Visibility } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import { unapproveProjectService } from '#services/projects/approval/unapprove-project.ts';
import addImageService from '#services/projects/images/add-image.ts';
import { transformProjectImage } from '#services/transformers/projects/parts/project-image.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */

const imageData: Prisma.ProjectImagesCreateInput = {
  image: 'www.test.com',
  altText: 'test image',
  position: 3,
  projects: {
    connect: {
      projectId: 1,
    },
  },
};

const prismaImage = {
  image: 'www.test.com',
  altText: 'test image',
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

const prismaProject = {
  projectId: 1,
  title: 'Test Project',
  hook: 'Test Hook',
  description: 'Test Description',
  thumbnailId: null,
  context: null,
  status: 'Planning' as ProjectStatus,
  audience: 'Human' as const,
  userId: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
  globalVisibility: 'Public' as Visibility,
  approved: true,
};

vi.mock('#config/prisma.ts', () => ({
  default: {
    projectImages: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    projects: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/project-image.ts', () => ({
  transformProjectImage: vi.fn(),
}));

vi.mock('#services/projects/approval/unapprove-project.ts', () => ({
  unapproveProjectService: vi.fn(),
}));

describe('addImageService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns the image if successful', async () => {
    vi.mocked(prisma.projectImages.create).mockResolvedValue(prismaImage);
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject);
    vi.mocked(unapproveProjectService).mockResolvedValue('OK');
    vi.mocked(transformProjectImage).mockResolvedValue(transformedImage);
    const result = await addImageService(imageData);

    expect(result).toBe(transformedImage);
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projectImages.create).mockRejectedValue(new Error('womp womp'));
    vi.mocked(transformProjectImage).mockResolvedValue(transformedImage);
    const result = await addImageService(imageData);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
