import type { ProjectPreview, Role } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformRole } from '#services/transformers/datasets/role.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';
import { transformUserMember } from '#services/transformers/users/parts/user-member.ts';

type PrismaMember = {
  userId: number;
  profileVisibility: 'public' | 'private';
  createdAt: Date;
  projects: {
    projectId: number;
    title: string;
    hook: string;
    thumbnailId: number | null;
    userId: number;
    thumbnail: {
      projectId: number;
      position: number;
      imageId: number;
      image: string;
      altText: string;
    } | null;
    mediums: { mediumId: number; label: string }[];
    users: {
      title: string;
      userId: number;
      firstName: string;
      lastName: string;
      username: string;
      profileImage: string | null;
      mentor: boolean;
      userSkills: { skills: { type: string } }[];
      funFact: string;
      pronouns: string;
      headline: string;
      location: string;
      majors: { majorId: number; label: string }[];
    };
  };
  roles: { roleId: number; label: string };
};

vi.mock('#services/transformers/datasets/role.ts', () => ({
  transformRole: vi.fn(),
}));

vi.mock('#services/transformers/projects/project-preview.ts', () => ({
  transformProjectToPreview: vi.fn(),
}));

describe('transformUserMember', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps member with public visibility correctly', () => {
    const createdAt = new Date('2024-01-01');

    const prismaMember: PrismaMember = {
      userId: 7,
      profileVisibility: 'public',
      createdAt,
      projects: {
        projectId: 99,
        title: '',
        hook: '',
        thumbnailId: null,
        userId: 0,
        thumbnail: null,
        mediums: [],
        users: {
          title: '',
          userId: 0,
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
      },
      roles: { roleId: 1, label: 'Lead' },
    };

    vi.mocked(transformProjectToPreview).mockReturnValue({
      projectId: 99,
    } as ProjectPreview);

    vi.mocked(transformRole).mockReturnValue({
      roleId: 1,
      label: 'Lead',
    } as Role);

    const result = transformUserMember(prismaMember);

    expect(result).toEqual({
      project: { projectId: 99 },
      visibility: 'Public',
      role: { roleId: 1, label: 'Lead' },
      memberSince: createdAt,
      apiUrl: '/api/projects/99/members/7',
    });

    expect(transformProjectToPreview).toHaveBeenCalledWith(prismaMember.projects);
    expect(transformRole).toHaveBeenCalledWith(prismaMember.roles);
  });

  it('maps private visibility correctly', () => {
    const prismaMember: PrismaMember = {
      userId: 3,
      projects: {
        projectId: 10,
        title: '',
        hook: '',
        thumbnailId: null,
        userId: 0,
        thumbnail: null,
        mediums: [],
        users: {
          title: '',
          userId: 0,
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
      },
      profileVisibility: 'private',
      roles: {
        roleId: 2,
        label: '',
      },
      createdAt: new Date(),
    };

    vi.mocked(transformProjectToPreview).mockReturnValue({ projectId: 10 } as ProjectPreview);
    vi.mocked(transformRole).mockReturnValue({ roleId: 2 } as Role);

    const result = transformUserMember(prismaMember);

    expect(result.visibility).toBe('Private');
  });
});
