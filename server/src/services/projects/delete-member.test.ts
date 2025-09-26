import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { deleteMemberService } from '#services/projects/delete-member.ts';

// Mock the prisma import
vi.mock('#config/prisma.ts', () => ({
  default: {
    members: {
      delete: vi.fn(),
    },
    projects: {
      findUnique: vi.fn(),
    },
  },
}));

// Import the mocked prisma to get the mock functions
import prisma from '#config/prisma.ts';
const mockPrisma = prisma as any;

describe('deleteMemberService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully delete a project member', async () => {
    const projectId = 1;
    const memberId = 2;
    const ownerId = 3;

    // Mock project exists and member is not owner
    mockPrisma.projects.findUnique.mockResolvedValue({
      projectId,
      userId: ownerId,
    });

    // Mock successful member deletion
    mockPrisma.members.delete.mockResolvedValue({
      projectId,
      userId: memberId,
    });

    const result = await deleteMemberService(projectId, memberId);

    expect(result).toBe('NO_CONTENT');
    expect(mockPrisma.projects.findUnique).toHaveBeenCalledWith({
      where: { projectId },
      select: { userId: true },
    });
    expect(mockPrisma.members.delete).toHaveBeenCalledWith({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId,
        },
      },
    });
  });

  it('should return NOT_FOUND when project does not exist', async () => {
    const projectId = 1;
    const memberId = 2;

    // Mock project does not exist
    mockPrisma.projects.findUnique.mockResolvedValue(null);

    const result = await deleteMemberService(projectId, memberId);

    expect(result).toBe('NOT_FOUND');
    expect(mockPrisma.members.delete).not.toHaveBeenCalled();
  });

  it('should return NOT_FOUND when trying to delete project owner', async () => {
    const projectId = 1;
    const memberId = 2;

    // Mock project exists and member is the owner
    mockPrisma.projects.findUnique.mockResolvedValue({
      projectId,
      userId: memberId, // Same as memberId - owner trying to be deleted
    });

    const result = await deleteMemberService(projectId, memberId);

    expect(result).toBe('NOT_FOUND');
    expect(mockPrisma.members.delete).not.toHaveBeenCalled();
  });

  it('should return NOT_FOUND when member does not exist (Prisma P2025)', async () => {
    const projectId = 1;
    const memberId = 2;
    const ownerId = 3;

    // Mock project exists
    mockPrisma.projects.findUnique.mockResolvedValue({
      projectId,
      userId: ownerId,
    });

    // Mock Prisma P2025 error (record not found)
    const prismaError = new Error('Record not found');
    (prismaError as any).code = 'P2025';
    mockPrisma.members.delete.mockRejectedValue(prismaError);

    const result = await deleteMemberService(projectId, memberId);

    expect(result).toBe('NOT_FOUND');
  });

  it('should return INTERNAL_ERROR when database operations fail', async () => {
    const projectId = 1;
    const memberId = 2;
    const ownerId = 3;

    // Mock project exists
    mockPrisma.projects.findUnique.mockResolvedValue({
      projectId,
      userId: ownerId,
    });

    // Mock general database error
    mockPrisma.members.delete.mockRejectedValue(new Error('Database connection failed'));

    const result = await deleteMemberService(projectId, memberId);

    expect(result).toBe('INTERNAL_ERROR');
  });

  it('should handle database error during project lookup', async () => {
    const projectId = 1;
    const memberId = 2;

    // Mock database error during project lookup
    mockPrisma.projects.findUnique.mockRejectedValue(new Error('Database connection failed'));

    const result = await deleteMemberService(projectId, memberId);

    expect(result).toBe('INTERNAL_ERROR');
    expect(mockPrisma.members.delete).not.toHaveBeenCalled();
  });
});