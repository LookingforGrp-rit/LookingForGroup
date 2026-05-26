import type { ProjectSocial, ProjectPurpose, ProjectStatus } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import prisma from '#config/prisma.ts';
import getProjectSocialsService from '#services/projects/socials/get-proj-socials.ts';
import { transformProjectSocial } from '#services/transformers/projects/parts/project-social.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/project-social.ts', () => ({
  transformProjectSocial: vi.fn(),
}));

const now = new Date();

const testSocial1 = {
  websiteId: 29,
  url: 'www.test.com',
  label: 'Test',
};

const testSocial2 = {
  websiteId: 42,
  url: 'www.test2.com',
  label: 'Test 2',
};

const prismaProject = {
  audience: '',
  createdAt: now,
  description: '',
  hook: '',
  projectId: 100,
  purpose: 'Academic' as ProjectPurpose,
  status: 'Planning' as ProjectStatus,
  thumbnailId: 8,
  title: 'test 1',
  updatedAt: now,
  userId: 1,
  projectSocials: [testSocial1, testSocial2],
};

const transformedSocials: ProjectSocial[] = [
  {
    websiteId: 29,
    url: 'www.test.com',
    label: 'Test',
    apiUrl: '/api/projects/1/socials/29',
  },
  {
    websiteId: 42,
    url: 'www.test2.com',
    label: 'Test 2',
    apiUrl: '/api/projects/1/socials/42',
  },
];

describe('getProjectSocialsService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (transformProjectSocial as Mock).mockImplementation(
      (projectId: number, { url, websiteId, label }) => ({
        label: label,
        websiteId: websiteId,
        url: url,
        apiUrl: `/api/projects/${projectId.toString()}/socials/${websiteId.toString()}`,
      }),
    );
  });
  it('returns the socials when get is successful', async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject);
    const result = await getProjectSocialsService(1);

    expect(transformProjectSocial).toBeCalled();
    expect(transformProjectSocial).toBeCalledTimes(2);
    expect(result).toEqual(transformedSocials);
  });

  it("returns NOT_FOUND when project doesn't exist", async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(null);
    const result = await getProjectSocialsService(1);

    expect(result).toEqual('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.projects.findUnique).mockRejectedValue(new Error('womp womp'));
    const result = await getProjectSocialsService(1);

    expect(result).toEqual('INTERNAL_ERROR');
  });
});
