import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteMajorServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteMajorServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

//delete a medium
export const deleteMajorService = async (
  userId: number,
  majorId: number,
): Promise<DeleteMajorServiceSuccess | DeleteMajorServiceError> => {
  try {
    await prisma.users.update({
      where: {
        userId: userId,
      },
      select: {
        majors: true,
      },
      data: {
        majors: {
          disconnect: {
            majorId,
          },
        },
      },
    });

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteMajorService:', error);

    if (error instanceof Object && 'code' in error) {
      if (error.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }

    return 'INTERNAL_ERROR';
  }
};
