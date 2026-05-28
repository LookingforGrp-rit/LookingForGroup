import type { ProjectImage, ProjectStatus, ProjectPurpose } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import prisma from '#config/prisma.ts';
import reorderImagesService from '#services/projects/images/reorder-images.ts';
import { transformProjectImage } from '#services/transformers/projects/parts/project-image.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment*/
/* eslint-disable @typescript-eslint/no-unsafe-call*/
/* eslint-disable @typescript-eslint/no-unsafe-member-access*/
/* eslint-disable @typescript-eslint/restrict-template-expressions*/
/* eslint-disable @typescript-eslint/require-await */

const prismaImage1 = {
  image: 'www.test.com',
  altText: 'test image',
  position: 1,
  projectId: 1,
  imageId: 4,
};

const prismaImage2 = {
  image: 'www.test2.com',
  altText: 'test image 2',
  position: 2,
  projectId: 1,
  imageId: 5,
};

const transformedImages: ProjectImage[] = [
  {
    image: 'www.test2.com',
    altText: 'test image 2',
    imageId: 5,
    apiUrl: 'api/projects/1/images/5',
  },
  {
    image: 'www.test.com',
    altText: 'test image',
    imageId: 4,
    apiUrl: 'api/projects/1/images/4',
  },
];

const now = new Date();

const prismaProject = {
  audience: '',
  createdAt: now,
  description: '',
  hook: '',
  projectId: 1,
  purpose: 'Academic' as ProjectPurpose,
  status: 'Planning' as ProjectStatus,
  thumbnailId: 0,
  title: 'test 1',
  updatedAt: now,
  userId: 1,
  projectImages: [prismaImage2, prismaImage1],
};

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findFirst: vi.fn(),
    },
    projectImages: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/project-image.ts', () => ({
  transformProjectImage: vi.fn(),
}));

describe('reorderImageService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (transformProjectImage as Mock).mockImplementation(
      (projectId: number, { imageId, image, altText }) => {
        return {
          apiUrl: `api/projects/${projectId.toString()}/images/${imageId.toString()}`,
          imageId,
          image,
          altText,
        };
      },
    );
  });
  it('returns the images if successful', async () => {
    vi.mocked(prisma.projectImages.findFirst).mockResolvedValueOnce(prismaImage1);
    vi.mocked(prisma.projectImages.findFirst).mockResolvedValueOnce(prismaImage2);
    vi.mocked(prisma.projects.findFirst).mockResolvedValue(prismaProject);
    const result = await reorderImagesService(1, { imageOrder: [2, 1] });

    expect(transformProjectImage).toBeCalled();
    expect(transformProjectImage).toBeCalledTimes(2);
    expect(result).toStrictEqual(transformedImages);
  });

  it("returns NOT_FOUND if an image isn't found", async () => {
    vi.mocked(prisma.projectImages.findFirst).mockResolvedValueOnce(null);
    vi.mocked(prisma.projectImages.findFirst).mockResolvedValueOnce(prismaImage2);
    vi.mocked(prisma.projects.findFirst).mockResolvedValue(prismaProject);
    const result = await reorderImagesService(1, { imageOrder: [2, 1] });

    expect(result).toBe('NOT_FOUND');
  });

  it("returns NOT_FOUND if a project isn't found", async () => {
    vi.mocked(prisma.projectImages.findFirst).mockResolvedValueOnce(prismaImage1);
    vi.mocked(prisma.projectImages.findFirst).mockResolvedValueOnce(prismaImage2);
    vi.mocked(prisma.projects.findFirst).mockResolvedValue(null);
    const result = await reorderImagesService(1, { imageOrder: [2, 1] });

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projectImages.findFirst).mockRejectedValueOnce(new Error('womp womp'));
    vi.mocked(prisma.projectImages.findFirst).mockResolvedValueOnce(prismaImage2);
    vi.mocked(prisma.projects.findFirst).mockResolvedValue(null);
    const result = await reorderImagesService(1, { imageOrder: [2, 1] });

    expect(result).toBe('INTERNAL_ERROR');
  });
});
