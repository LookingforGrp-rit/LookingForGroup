/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

vi.mock('#services/transformers/projects/project-preview.ts', () => ({
  transformProjectToPreview: vi.fn(),
}));

vi.mock('#services/transformers/projects/parts/project-image.ts', () => ({
  transformProjectImage: vi.fn(),
}));

vi.mock('#services/transformers/projects/parts/project-job.ts', () => ({
  transformProjectJob: vi.fn(),
}));

vi.mock('#services/transformers/projects/parts/project-member.ts', () => ({
  transformProjectMember: vi.fn(),
}));

vi.mock('#services/transformers/projects/parts/project-social.ts', () => ({
  transformProjectSocial: vi.fn(),
}));

vi.mock('#services/transformers/projects/parts/project-tag.ts', () => ({
  transformProjectTag: vi.fn(),
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformProjectImage } from '#services/transformers/projects/parts/project-image.ts';
import { transformProjectJob } from '#services/transformers/projects/parts/project-job.ts';
import { transformProjectMember } from '#services/transformers/projects/parts/project-member.ts';
import { transformProjectSocial } from '#services/transformers/projects/parts/project-social.ts';
import { transformProjectTag } from '#services/transformers/projects/parts/project-tag.ts';
import { transformProjectToDetail } from '#services/transformers/projects/project-detail.ts';
import type { ProjectDetailPayload } from '#services/transformers/projects/project-detail.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';

describe('transformProjectToDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('composes preview and detail fields correctly', () => {
    const prismaProject: ProjectDetailPayload = {
      projectId: 1,
      description: 'Deep steam lore.',
      audience: 'Everyone',
      createdAt: new Date(),
      updatedAt: new Date(),

      tags: [{} as any],
      projectImages: [{} as any],
      projectSocials: [{} as any],
      jobs: [{} as any],
      members: [{} as any],

      title: 'Iron Garden',
      hook: 'Steam rises.',
      users: {} as any,
      mediums: [],
      thumbnail: 'image',
    } as unknown as ProjectDetailPayload;

    vi.mocked(transformProjectToPreview).mockReturnValue({
      projectId: 1,
      title: 'Iron Garden',
      hook: 'Steam rises.',
      owner: { userId: 5 },
      mediums: [],
      apiUrl: '/api/projects/1',
    } as any);

    vi.mocked(transformProjectTag).mockReturnValue({ tagId: 1 } as any);
    // vi.mocked(transformProjectImage).mockReturnValue({ imageId: 2 } as any);
    vi.mocked(transformProjectSocial).mockReturnValue({ socialId: 3 } as any);
    vi.mocked(transformProjectJob).mockReturnValue({ jobId: 4 } as any);
    vi.mocked(transformProjectMember).mockReturnValue({ memberid: 5 } as any);

    const result = transformProjectToDetail(prismaProject);

    expect(transformProjectToPreview).toHaveBeenCalledWith(prismaProject);
    expect(transformProjectTag).toHaveBeenCalled();
    expect(transformProjectImage).toHaveBeenCalled();
    expect(transformProjectSocial).toHaveBeenCalled();
    expect(transformProjectJob).toHaveBeenCalled();
    expect(transformProjectMember).toHaveBeenCalled();

    expect(result.description).toBe('Deep steam lore.');
    expect(result.tags.length).toBe(1);
    expect(result.projectImages.length).toBe(1);
    expect(result.projectSocials.length).toBe(1);
    expect(result.jobs.length).toBe(1);
    expect(result.members.length).toBe(1);

    expect(result.title).toBe('Iron Garden');
    expect(result.apiUrl).toBe('/api/projects/1');
  });
});
