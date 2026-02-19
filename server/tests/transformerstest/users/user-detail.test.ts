import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transformSkill } from '#services/transformers/datasets/skill.ts';
import { transformSocial } from '#services/transformers/datasets/social.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';
import { transformUserMember } from '#services/transformers/users/parts/user-member.ts';
import { transformUserToDetail } from '#services/transformers/users/user-detail.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#services/transformers/datasets/skill.ts', () => ({
  transformSkill: vi.fn(),
}));

vi.mock('#services/transformers/datasets/social.ts', () => ({
  transformSocial: vi.fn(),
}));

vi.mock('#services/transformers/projects/project-preview.ts', () => ({
  transformProjectToPreview: vi.fn(),
}));

vi.mock('#services/transformers/users/parts/user-member.ts', () => ({
  transformUserMember: vi.fn(),
}));

vi.mock('#services/transformers/users/user-preview.ts', () => ({
  transformUserToPreview: vi.fn(),
}));

describe('transformUserToDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps full user graph into UserDetail', () => {
    //fake prisma user
    const prismaUser: any = {
      userId: 10,
      bio: 'Clockwork soul',
      academicYear: 'Senior',

      userSkills: [
        {
          position: 1,
          proficiency: 5,
          skills: { skillId: 2, label: 'Forge' },
        },
      ],

      userSocials: [
        {
          url: 'https://x.com/me',
          socials: { websiteId: 3, label: 'X' },
        },
      ],

      members: [{ projectId: 1 }],
      followers: [
        {
          followedAt: new Date('2025-01-01'),
          senderUser: { userId: 2 },
        },
      ],
      following: [
        {
          followedAt: new Date('2025-01-02'),
          receiverUser: { userId: 3 },
        },
      ],

      projectFollowings: [
        {
          followedAt: new Date('2025-01-03'),
          projects: { projectId: 99 },
        },
      ],

      _count: {
        followers: 1,
        following: 1,
        projectFollowings: 1,
      },
    };

    //transform stubs
    vi.mocked(transformUserToPreview).mockReturnValue({
      userId: 10,
      username: 'ember',
      apiUrl: '/api/users/10',
    } as any);

    vi.mocked(transformSkill).mockReturnValue({ skillId: 2, label: 'Forge' } as any);
    vi.mocked(transformSocial).mockReturnValue({ websiteId: 3, label: 'X' } as any);

    vi.mocked(transformUserMember).mockReturnValue({ projectId: 1 } as any);
    vi.mocked(transformProjectToPreview).mockReturnValue({ projectId: 99 } as any);

    const result = transformUserToDetail(prismaUser);

    expect(result.bio).toBe('Clockwork soul');
    expect(result.academicYear).toBe('Senior');

    expect(result.skills).toEqual([{ skillId: 2, label: 'Forge', proficiency: 5, position: 1 }]);

    expect(result.socials).toEqual([{ websiteId: 3, label: 'X', url: 'https://x.com/me' }]);

    expect(result.projects).toEqual([{ projectId: 1 }]);

    expect(result.followers.count).toBe(1);
    expect(result.followers.count).toBe(1);
    expect(result.followers.users[0]).toHaveProperty('followedAt');
    expect(result.followers.users[0].user).toHaveProperty('userId');

    expect(result.following.usersFollowing.count).toBe(1);
    expect(result.following.projectsFollowing.count).toBe(1);

    expect(result.following.projectsFollowing.projects[0].project).toEqual({
      projectId: 99,
    });

    expect(result.followers.apiUrl).toBe('/api/users/10/followers');
    expect(result.following.usersFollowing.apiUrl).toBe('/api/users/10/followings/people');
    expect(result.following.projectsFollowing.apiUrl).toBe('/api/users/10/followings/projects');
  });
});
