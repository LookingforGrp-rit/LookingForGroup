import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type LeaveProjectServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'FORBIDDEN'>;
type LeaveProjectServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

/**
 * Allows a user to leave a project by updating their profile visibility to private
 * This is different from deleting a member (which only project owners can do)
 */
export const leaveProjectService = async (
  projectId: number,
  userId: number,
): Promise<LeaveProjectServiceError | LeaveProjectServiceSuccess> => {
  try {
    // First verify the user is actually a member of the project
    const existingMember = await prisma.members.findUnique({
      where: {
        projectId_userId: {
          projectId: projectId,
          userId: userId,
        },
      },
    });

    if (!existingMember) {
      return 'NOT_FOUND';
    }

    // Check if user is the project owner - owners cannot leave their own projects
    const project = await prisma.projects.findUnique({
      where: { projectId },
      select: { userId: true },
    });

    if (!project) {
      return 'NOT_FOUND';
    }

    if (project.userId === userId) {
      return 'FORBIDDEN';
    }

    // Update the member's visibility to private to indicate they've left
    await prisma.members.delete({
      where: {
        projectId_userId: {
          projectId: projectId,
          userId: userId,
        },
      },
    });

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in leaveProjectService:', error);

    if (error instanceof Object && 'code' in error) {
      if (error.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }

    return 'INTERNAL_ERROR';
  }
};
