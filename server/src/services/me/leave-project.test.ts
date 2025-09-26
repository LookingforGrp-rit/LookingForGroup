import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { leaveProjectService } from '#services/me/leave-project.ts';

// Mock the prisma import
vi.mock('#config/prisma.ts', () => ({
  default: {
    members: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    projects: {
      findUnique: vi.fn(),
    },
  },
}));

// Import the mocked prisma to get the mock functions
import prisma from '#config/prisma.ts';
const mockPrisma = prisma as any;

describe('leaveProjectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should successfully allow a member to leave a project', async () => {
    const projectId = 1;
    const userId = 2;
    const ownerId = 3;

    // Mock member exists
    mockPrisma.members.findUnique.mockResolvedValue({
      projectId,
      userId,
      roleId: 1,
      profileVisibility: 'public',
    });

    // Mock project exists and user is not owner
    mockPrisma.projects.findUnique.mockResolvedValue({
      projectId,
      userId: ownerId,
    });

    // Mock successful update
    mockPrisma.members.update.mockResolvedValue({
      projectId,
      userId,
      profileVisibility: 'private',
    });

    const result = await leaveProjectService(projectId, userId);

    expect(result).toBe('NO_CONTENT');
    expect(mockPrisma.members.findUnique).toHaveBeenCalledWith({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
    expect(mockPrisma.projects.findUnique).toHaveBeenCalledWith({
      where: { projectId },
      select: { userId: true },
    });
    expect(mockPrisma.members.update).toHaveBeenCalledWith({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      data: {
        profileVisibility: 'private',
      },
    });
  });

  it('should return NOT_FOUND when user is not a member of the project', async () => {
    const projectId = 1;
    const userId = 2;

    // Mock member does not exist
    mockPrisma.members.findUnique.mockResolvedValue(null);

    const result = await leaveProjectService(projectId, userId);

    expect(result).toBe('NOT_FOUND');
    expect(mockPrisma.members.findUnique).toHaveBeenCalledWith({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
    expect(mockPrisma.projects.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.members.update).not.toHaveBeenCalled();
  });

  it('should return NOT_FOUND when project does not exist', async () => {
    const projectId = 1;
    const userId = 2;

    // Mock member exists
    mockPrisma.members.findUnique.mockResolvedValue({
      projectId,
      userId,
      roleId: 1,
      profileVisibility: 'public',
    });

    // Mock project does not exist
    mockPrisma.projects.findUnique.mockResolvedValue(null);

    const result = await leaveProjectService(projectId, userId);

    expect(result).toBe('NOT_FOUND');
    expect(mockPrisma.members.update).not.toHaveBeenCalled();
  });

  it('should return FORBIDDEN when user is the project owner', async () => {
    const projectId = 1;
    const userId = 2;

    // Mock member exists
    mockPrisma.members.findUnique.mockResolvedValue({
      projectId,
      userId,
      roleId: 1,
      profileVisibility: 'public',
    });

    // Mock project exists and user is the owner
    mockPrisma.projects.findUnique.mockResolvedValue({
      projectId,
      userId, // Same userId as the one trying to leave
    });

    const result = await leaveProjectService(projectId, userId);

    expect(result).toBe('FORBIDDEN');
    expect(mockPrisma.members.update).not.toHaveBeenCalled();
  });

  it('should return INTERNAL_ERROR when database operations fail', async () => {
    const projectId = 1;
    const userId = 2;

    // Mock member exists
    mockPrisma.members.findUnique.mockResolvedValue({
      projectId,
      userId,
      roleId: 1,
      profileVisibility: 'public',
    });

    // Mock project exists
    mockPrisma.projects.findUnique.mockResolvedValue({
      projectId,
      userId: 3,
    });

    // Mock database error on update
    mockPrisma.members.update.mockRejectedValue(new Error('Database connection failed'));

    const result = await leaveProjectService(projectId, userId);

    expect(result).toBe('INTERNAL_ERROR');
  });

  it('should handle Prisma P2025 error (record not found during update)', async () => {
    const projectId = 1;
    const userId = 2;

    // Mock member exists
    mockPrisma.members.findUnique.mockResolvedValue({
      projectId,
      userId,
      roleId: 1,
      profileVisibility: 'public',
    });

    // Mock project exists
    mockPrisma.projects.findUnique.mockResolvedValue({
      projectId,
      userId: 3,
    });

    // Mock Prisma P2025 error (record not found)
    const prismaError = new Error('Record not found');
    (prismaError as any).code = 'P2025';
    mockPrisma.members.update.mockRejectedValue(prismaError);

    const result = await leaveProjectService(projectId, userId);

    expect(result).toBe('NOT_FOUND');
  });
});