import type { ProjectImage, ProjectStatus, ProjectPurpose } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import prisma from '#config/prisma.ts';
import getProjectImagesService from '#services/projects/images/get-proj-images.ts';
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
    image: 'www.test.com',
    altText: 'test image',
    imageId: 4,
    apiUrl: 'api/projects/1/images/4',
  },
  {
    image: 'www.test2.com',
    altText: 'test image 2',
    imageId: 5,
    apiUrl: 'api/projects/1/images/5',
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
  projectImages: [prismaImage1, prismaImage2],
};

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findUnique: vi.fn(),
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
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject);
    const result = await getProjectImagesService(1);

    expect(transformProjectImage).toBeCalled();
    expect(transformProjectImage).toBeCalledTimes(2);
    expect(result).toStrictEqual(transformedImages);
  });
  it("returns NOT_FOUND if the project isn't found", async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(null);
    const result = await getProjectImagesService(1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projects.findUnique).mockRejectedValue(new Error('womp womp'));
    const result = await getProjectImagesService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
