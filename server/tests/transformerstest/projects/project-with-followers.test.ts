import type { ProjectDetail } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ProjectsPurpose, ProjectsStatus } from '#prisma-models/index.js';
import { transformProjectToFollowers } from '#services/transformers/projects/parts/project-followers.ts';
import { transformProjectToDetail } from '#services/transformers/projects/project-detail.ts';
import { transformProjectToWithFollowers } from '#services/transformers/projects/project-with-followers.ts';

vi.mock('#services/transformers/projects/project-detail.ts', () => ({
  transformProjectToDetail: vi.fn(),
}));

vi.mock('#services/transformers/projects/parts/project-followers.ts', () => ({
  transformProjectToFollowers: vi.fn(),
}));

interface PrismaProject {
  projectId: number;
  title: string;
  hook: string;
  description: string;
  thumbnailId: number | null;
  purpose: ProjectsPurpose | null;
  status: ProjectsStatus;
  audience: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  thumbnail: never;
  mediums: never[];
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
  jobs: never[];
  members: never[];
  projectFollowings: never[];
  projectImages: never[];
  projectSocials: never[];
  tags: never[];
  _count: {
    followers: number;
    projectFollowings: number;
  };
}

describe('transformProjectWithFollowers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('merges detail and followers correctly', () => {
    const prismaProject: PrismaProject = {
      projectId: 77,
      title: 'Iron Garden',
      hook: 'test-hook',
      description: 'test-description',
      thumbnailId: null,
      purpose: null,
      status: 'Planning',
      audience: '',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      mediums: [],
      _count: {
        followers: 1,
        projectFollowings: 0,
      },
      users: {
        title: '',
        userId: 1,
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        profileImage: null,
        mentor: false,
        userSkills: [],
        funFact: '',
        pronouns: '',
        headline: '',
        location: '',
        majors: [{ majorId: 1, label: 'Computer Science' }],
      },
      thumbnail: undefined as never,
      jobs: [] as never[],
      members: [] as never[],
      projectFollowings: [] as never[],
      projectImages: [] as never[],
      projectSocials: [] as never[],
      tags: [] as never[],
    };

    const detailResult = {
      projectId: 77,
      title: 'Iron Garden',
      apiUrl: '/api/projects/77',
    } as ProjectDetail;

    const followersResult = {
      users: [
        {
          user: {
            userId: 1,
            firstName: 'Test',
            lastName: 'User',
            username: 'testuser',
            profileImage: null,
            mentor: false,
            designer: false,
            developer: false,
            headline: '',
            pronouns: '',
            title: '',
            funFact: '',
            location: '',
            majors: [],
            apiUrl: '/api/users/1',
          },
          followedAt: new Date('2025-01-01'),
        },
      ],
      count: 1,
      apiUrl: '/api/projects/77/followers',
    };

    vi.mocked(transformProjectToDetail).mockReturnValue(detailResult);
    vi.mocked(transformProjectToFollowers).mockReturnValue(followersResult);

    const result = transformProjectToWithFollowers(prismaProject);

    expect(transformProjectToDetail).toHaveBeenCalledWith(prismaProject);
    expect(transformProjectToFollowers).toHaveBeenCalledWith(prismaProject);

    expect(result).toEqual({
      ...detailResult,
      followers: followersResult,
    });
  });
});
