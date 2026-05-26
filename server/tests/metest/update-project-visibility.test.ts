import type {
  MyMember,
  ProjectPreview,
  Role,
  UserPreview,
  Visibility,
} from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { updateProjectVisibility } from '#services/me/update-project-visibility.ts';
import { MyMemberSelector } from '#services/selectors/me/parts/my-member.ts';
import { transformMyMember } from '#services/transformers/me/parts/my-member.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    members: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/me/parts/my-member.ts', () => ({
  transformMyMember: vi.fn(),
}));

const prismaMember = {
  projectId: 1,
  userId: 1,
  roleId: 1,
  profileVisibility: 'public',
  createdAt: new Date(),
};

const transformed: MyMember = {
  apiUrl: 'api/projects/1/members/1',
  memberSince: new Date(),
  project: {
    apiUrl: 'api/projects/1',
    hook: '',
    mediums: [
      {
        apiUrl: 'api/projects/1/mediums/1',
        label: '',
        mediumId: 1,
      },
    ],
    owner: {
      apiUrl: 'api/users/2',
      userId: 2,
    } as UserPreview,
    projectId: 1,
    thumbnail: null,
    thumbnailId: 0,
    title: '',
  } as ProjectPreview,
  role: {
    roleId: 1,
    label: 'Member',
  } as Role,
  visibility: 'Private' as Visibility,
};

describe('updateProjectVisibilityService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NOT_FOUND when user is not a member of the project', async () => {
    vi.mocked(prisma.members.findUnique).mockResolvedValue(null);

    const result = await updateProjectVisibility(1, 1, 'private');

    expect(result).toBe('NOT_FOUND');
  });

  it('returns transformed member when visibility is undefined', async () => {
    vi.mocked(prisma.members.findUnique).mockResolvedValue(prismaMember as any);
    vi.mocked(prisma.members.update).mockResolvedValue(prismaMember as any);
    vi.mocked(transformMyMember).mockReturnValue(transformed);

    const result = await updateProjectVisibility(1, 1, undefined);

    expect(result).toBe(transformed);
  });

  it('returns transformed member when visibility is successfully updated', async () => {
    const prismaMemberUpdated = prismaMember;
    prismaMemberUpdated.profileVisibility = 'private';

    vi.mocked(prisma.members.findUnique).mockResolvedValue(prismaMember as any);
    vi.mocked(prisma.members.update).mockResolvedValue(prismaMemberUpdated as any);
    vi.mocked(transformMyMember).mockReturnValue(transformed);

    const result = await updateProjectVisibility(1, 1, 'private');

    expect(prisma.members.update).toHaveBeenCalledWith({
      where: {
        projectId_userId: {
          projectId: 1,
          userId: 1,
        },
      },
      data: {
        profileVisibility: 'private',
      },
      select: MyMemberSelector,
    });
    expect(result).toBe(transformed);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.members.findUnique).mockRejectedValue(new Error('db cursed'));

    const result = await updateProjectVisibility(1, 1, 'private');

    expect(result).toBe('INTERNAL_ERROR');
  });
});
