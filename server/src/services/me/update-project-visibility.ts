import type { MyMember } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MyMemberSelector } from '#services/selectors/me/parts/my-member.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMyMember } from '#services/transformers/me/parts/my-member.ts';

type UpdateProjectVisibilityServiceError = ServiceErrorSubset<
  'INTERNAL_ERROR' | 'NOT_FOUND' | 'FORBIDDEN'
>;

/**
 * Allows a user to leave a project by updating their profile visibility to private
 * This is different from deleting a member (which only project owners can do)
 */
export const updateProjectVisibility = async (
  projectId: number,
  userId: number,
  visibility: 'private' | 'public' | undefined,
): Promise<UpdateProjectVisibilityServiceError | MyMember> => {
  try {
    // First verify the user is actually a member of the project
    const existingMember = await prisma.members.findUnique({
      where: {
        projectId_userId: {
          projectId: projectId,
          userId: userId,
        },
      },
      select: MyMemberSelector,
    });

    if (!existingMember) {
      return 'NOT_FOUND';
    }

    if (!visibility) {
      return transformMyMember(existingMember);
    }

    // Update the member's visibility
    const updatedMember = await prisma.members.update({
      where: {
        projectId_userId: {
          projectId: projectId,
          userId: userId,
        },
      },
      data: {
        profileVisibility: visibility,
      },
      select: MyMemberSelector,
    });

    return transformMyMember(updatedMember);
  } catch (error) {
    console.error('Error in updateProjectVisibilityService:', error);

    if (error instanceof Object && 'code' in error) {
      if (error.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }

    return 'INTERNAL_ERROR';
  }
};
