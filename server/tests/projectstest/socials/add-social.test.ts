import type { AddProjectSocialInput, ProjectSocial } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { addProjectSocialService } from '#services/projects/socials/add-social.ts';
import { transformProjectSocial } from '#services/transformers/projects/parts/project-social.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    socials: {
      findFirst: vi.fn(),
    },
    projectSocials: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/project-social.ts', () => ({
  transformProjectSocial: vi.fn(),
}));

const data: AddProjectSocialInput = {
  websiteId: 29,
  url: 'www.test.com',
};

const testSocial = {
  projectId: 1,
  websiteId: 29,
  url: 'www.test.com',
  label: 'Test',
};

const transformedSocial: ProjectSocial = {
  websiteId: 29,
  url: 'www.test.com',
  label: 'Test',
  apiUrl: 'api/project/1/socials/29',
};

describe('addProjectSocialService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns the social when add is successful', async () => {
    vi.mocked(prisma.socials.findFirst).mockResolvedValue({ websiteId: 29, label: 'Test' });
    vi.mocked(prisma.projectSocials.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.projectSocials.create).mockResolvedValue(testSocial);
    vi.mocked(transformProjectSocial).mockReturnValue(transformedSocial);
    const result = await addProjectSocialService(data, 1);

    expect(transformProjectSocial).toBeCalled();
    expect(transformProjectSocial).toBeCalledWith(1, testSocial);
    expect(result).toBe(transformedSocial);
  });
});
