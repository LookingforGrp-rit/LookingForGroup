import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type UpdateUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//visibiliry might need to be changed to boolean
export const updateUserVisibilityService = async (
  userId: number,
  visibility: number,
): Promise<{ visibility: number } | UpdateUserServiceError> => {
  try {
    const user = await prisma.users.update({
      where: { userId },
      data: { visibility },
      select: { visibility: true },
    });

    return { visibility: user.visibility };
  } catch (e) {
    console.error('Error in updateUserVisibilityService:', e);
    return 'INTERNAL_ERROR';
  }
};
