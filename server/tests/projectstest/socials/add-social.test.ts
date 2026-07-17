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
  alias: 'url label',
};

const testSocial = {
  id: 1,
  projectId: 1,
  websiteId: 29,
  url: 'www.test.com',
  label: 'Test',
  alias: 'url label',
};

const transformedSocial: ProjectSocial = {
  id: 1,
  websiteId: 29,
  url: 'www.test.com',
  label: 'Test',
  alias: 'url label',
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

    expect(transformProjectSocial).toHaveBeenCalled();
    expect(transformProjectSocial).toHaveBeenCalledWith(1, testSocial);
    expect(result).toBe(transformedSocial);
  });
  it("returns NOT_FOUND when websiteId isn't found", async () => {
    vi.mocked(prisma.socials.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.projectSocials.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.projectSocials.create).mockResolvedValue(testSocial);
    vi.mocked(transformProjectSocial).mockReturnValue(transformedSocial);
    const result = await addProjectSocialService(data, 1);

    expect(result).toBe('NOT_FOUND');
  });
  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.socials.findFirst).mockRejectedValue(new Error('womp womp'));
    vi.mocked(prisma.projectSocials.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.projectSocials.create).mockResolvedValue(testSocial);
    vi.mocked(transformProjectSocial).mockReturnValue(transformedSocial);
    const result = await addProjectSocialService(data, 1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
