import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type CheckForUnreadNotificationsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'CONFLICT'>;

const checkForUnreadNotificationsService = async (
  userId: number,
): Promise<CheckForUnreadNotificationsServiceError | boolean> => {
  try {
    const result = await prisma.notifications.findMany({
      where: {
        receiverId: userId,
        hasBeenRead: false,
      },
    });

    return result.length > 0;
  } catch (e) {
    console.error('There was an error in checkForUnreadNotificationsService', e);
    if (!(e instanceof Error && 'code' in e)) {
      return 'INTERNAL_ERROR';
    }

    if (e.code === 'P2003') {
      return 'CONFLICT';
    }

    return 'INTERNAL_ERROR';
  }
};

export default checkForUnreadNotificationsService;
