import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { leaveProjectService } from '#services/me/leave-project.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findUnique: vi.fn(),
    },
    members: {
      delete: vi.fn(),
    },
  },
}));

describe('leaveProjectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NOT_FOUND if project does not exist', async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(null);

    const result = await leaveProjectService(1, 1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns FORBIDDEN when the user is the owner', async () => {
    const prismaProject = {
      projectId: 1,
      userId: 1,
    };
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject as any);

    const result = await leaveProjectService(1, 1);

    expect(result).toBe('FORBIDDEN');
  });

  it('returns NO_CONTENT when leave project successfully', async () => {
    const prismaProject = {
      projectId: 1,
      userId: 2,
    };
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject as any);
    vi.mocked(prisma.members.delete).mockResolvedValue({ userId: 1 } as any);

    const result = await leaveProjectService(1, 1);

    expect(prisma.members.delete).toHaveBeenCalledWith({
      where: {
        projectId_userId: {
          projectId: 1,
          userId: 1,
        },
      },
    });
    expect(result).toBe('NO_CONTENT');
  });

  it('returns INTERNAL_ERROR on exception', async () => {
    vi.mocked(prisma.projects.findUnique).mockRejectedValue(new Error('db exploded :fire:'));

    const result = await leaveProjectService(1, 1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
