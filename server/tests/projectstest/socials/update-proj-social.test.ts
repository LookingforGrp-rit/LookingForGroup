import type { ProjectSocial, ProjectStatus, Visibility } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { unapproveProjectService } from '#services/projects/approval/unapprove-project.ts';
import { updateProjectSocialService } from '#services/projects/socials/update-proj-social.ts';
import { transformProjectSocial } from '#services/transformers/projects/parts/project-social.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projectSocials: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    projects: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/project-social.ts', () => ({
  transformProjectSocial: vi.fn(),
}));

vi.mock('#services/projects/approval/unapprove-project.ts', () => ({
  unapproveProjectService: vi.fn(),
}));

const transformedSocial: ProjectSocial = {
  id: 1,
  websiteId: 29,
  url: 'www.test.com',
  label: 'Test',
  alias: 'Click here to test',
  apiUrl: '/api/projects/1/socials/29',
};

const testSocial = {
  id: 1,
  projectId: 1,
  url: 'www.no-more-test.com',
  alias: 'Click here to ban test',
  socials: {
    websiteId: 12,
    label: 'Test',
  },
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

describe('updateProjectSocialService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the social when update is successful', async () => {
    vi.mocked(prisma.projectSocials.findUnique).mockResolvedValue(testSocial as any);
    vi.mocked(prisma.projectSocials.update).mockResolvedValue(testSocial as any);
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject);
    vi.mocked(unapproveProjectService).mockResolvedValue('OK');
    vi.mocked(transformProjectSocial).mockReturnValue(transformedSocial);
    const result = await updateProjectSocialService(
      {
        url: 'www.no-more-test.com',
        websiteId: 12,
        alias: 'Click here to ban test',
      },
      1,
      29,
    );

    expect(transformProjectSocial).toHaveBeenCalled();
    expect(result).toEqual(transformedSocial);
  });

  it("returns NOT_FOUND when social doesn't exist", async () => {
    vi.mocked(prisma.projectSocials.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.projectSocials.update).mockResolvedValue(testSocial as any);
    vi.mocked(transformProjectSocial).mockReturnValue(transformedSocial);
    const result = await updateProjectSocialService(
      {
        url: 'www.no-more-test.com',
        websiteId: 12,
        alias: 'Click here to ban test',
      },
      1,
      29,
    );

    expect(result).toEqual('NOT_FOUND');
  });

  it('does not update or unapprove when no social data changes', async () => {
    const unchangedSocial = {
      id: 1,
      projectId: 1,
      url: 'www.no-more-test.com',
      alias: 'Click here to ban test',
      socials: {
        websiteId: 12,
        label: 'Test',
      },
    };

    vi.mocked(prisma.projectSocials.findUnique).mockResolvedValue(unchangedSocial as any);
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject);
    vi.mocked(transformProjectSocial).mockReturnValue(transformedSocial);

    const result = await updateProjectSocialService(
      {
        url: 'www.no-more-test.com',
        websiteId: 12,
        alias: 'Click here to ban test',
      },
      1,
      1,
    );

    expect(prisma.projectSocials.update).not.toHaveBeenCalled();
    expect(unapproveProjectService).not.toHaveBeenCalled();
    expect(transformProjectSocial).toHaveBeenCalledWith(1, unchangedSocial);
    expect(result).toEqual(transformedSocial);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.projectSocials.findUnique).mockRejectedValue(new Error('womp womp'));
    vi.mocked(prisma.projectSocials.update).mockResolvedValue(testSocial as any);
    vi.mocked(transformProjectSocial).mockReturnValue(transformedSocial);
    const result = await updateProjectSocialService(
      {
        url: 'www.no-more-test.com',
        websiteId: 12,
        alias: 'Click here to ban test',
      },
      1,
      29,
    );

    expect(result).toEqual('INTERNAL_ERROR');
  });
});
