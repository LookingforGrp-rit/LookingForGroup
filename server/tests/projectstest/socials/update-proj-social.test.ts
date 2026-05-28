import type { ProjectSocial } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { updateProjectSocialService } from '#services/projects/socials/update-proj-social.ts';
import { transformProjectSocial } from '#services/transformers/projects/parts/project-social.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projectSocials: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/project-social.ts', () => ({
  transformProjectSocial: vi.fn(),
}));

const transformedSocial: ProjectSocial = {
  websiteId: 29,
  url: 'www.test.com',
  label: 'Test',
  apiUrl: '/api/projects/1/socials/29',
};

const testSocial = {
  projectId: 1,
  websiteId: 29,
  url: 'www.test.com',
};

describe('getProjectSocialsService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns the social when update is successful', async () => {
    vi.mocked(prisma.projectSocials.findUnique).mockResolvedValue(testSocial);
    vi.mocked(prisma.projectSocials.update).mockResolvedValue(testSocial);
    vi.mocked(transformProjectSocial).mockReturnValue(transformedSocial);
    const result = await updateProjectSocialService('www.test.com', 1, 29);

    expect(transformProjectSocial).toBeCalled();
    expect(result).toEqual(transformedSocial);
  });

  it("returns NOT_FOUND when social doesn't exist", async () => {
    vi.mocked(prisma.projectSocials.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.projectSocials.update).mockResolvedValue(testSocial);
    vi.mocked(transformProjectSocial).mockReturnValue(transformedSocial);
    const result = await updateProjectSocialService('www.test.com', 1, 29);

    expect(result).toEqual('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.projectSocials.findUnique).mockRejectedValue(new Error('womp womp'));
    vi.mocked(prisma.projectSocials.update).mockResolvedValue(testSocial);
    vi.mocked(transformProjectSocial).mockReturnValue(transformedSocial);
    const result = await updateProjectSocialService('www.test.com', 1, 29);

    expect(result).toEqual('INTERNAL_ERROR');
  });
});
