/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformProjectImage } from '#services/transformers/projects/parts/project-image.ts';
import { transformProjectMedium } from '#services/transformers/projects/parts/project-medium.ts';
import type { ProjectPreviewPayload } from '#services/transformers/projects/project-preview.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';

vi.mock('#services/transformers/users/user-preview.ts', () => ({
  transformUserToPreview: vi.fn(),
}));

vi.mock('#services/transformers/projects/parts/project-image.ts', () => ({
  transformProjectImage: vi.fn(),
}));

vi.mock('#services/transformers/projects/parts/project-medium.ts', () => ({
  transformProjectMedium: vi.fn(),
}));

describe('transformProjectToPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps project including thumbnail', () => {
    const prismaProject: ProjectPreviewPayload = {
      projectId: 42,
      title: 'Sky Loom',
      hook: 'Would you Sky a Loom',
      users: {
        userId: 1,
        title: '',
        firstName: '',
        lastName: '',
        username: '',
        profileImage: null,
        mentor: false,
        userSkills: [],
        funFact: '',
        pronouns: '',
        headline: '',
        location: '',
        majors: [],
      },
      mediums: [
        {
          mediumId: 5,
          label: '',
        },
      ],
      thumbnail: {
        imageId: 99,
        projectId: 0,
        position: 0,
        image: '',
        altText: '',
      },
      thumbnailId: null,
      userId: 0,
    };

    vi.mocked(transformUserToPreview).mockReturnValue({
      userId: 1,
      username: 'owner',
    } as any);

    vi.mocked(transformProjectMedium).mockReturnValue({
      mediumId: 5,
    } as any);

    vi.mocked(transformProjectImage).mockReturnValue({
      imageId: 99,
    } as any);

    const result = transformProjectToPreview(prismaProject);

    expect(transformUserToPreview).toHaveBeenCalledWith(prismaProject.users);
    expect(transformProjectMedium).toHaveBeenCalledWith(42, prismaProject.mediums[0]);
    expect(transformProjectImage).toHaveBeenCalledWith(42, prismaProject.thumbnail);

    expect(result).toEqual({
      projectId: 42,
      title: 'Sky Loom',
      hook: 'Would you Sky a Loom',
      owner: { userId: 1, username: 'owner' },
      mediums: [{ mediumId: 5 }],
      apiUrl: '/api/projects/42',
      thumbnail: { imageId: 99 },
    });
  });

  it('omits thumbnail when none exists', () => {
    const prismaProject: any = {
      projectId: 7,
      title: 'Iron Field',
      hook: 'Steel is not the same as iron',
      users: { userId: 2 },
      mediums: [],
      thumbnail: null,
    };

    vi.mocked(transformUserToPreview).mockReturnValue({
      userId: 2,
    } as any);

    const result = transformProjectToPreview(prismaProject);

    expect(transformProjectImage).not.toHaveBeenCalled();
    expect(result.thumbnail).toBeUndefined();
    expect(result.apiUrl).toBe('/api/projects/7');
  });
});
