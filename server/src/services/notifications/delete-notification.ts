import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type DeleteNotificationServiceError = ServiceErrorSubset<'NOT_FOUND' | 'INTERNAL_ERROR'>;
type DeleteNotificationServiceSuccess = ServiceSuccessSubset<'OK'>;

const deleteNotificationService = async (
  notificationId: string,
  receiverId: number,
): Promise<DeleteNotificationServiceError | DeleteNotificationServiceSuccess> => {
  try {
    await prisma.notifications.delete({
      where: {
        notificationId,
        receiverId,
      },
    });

    return 'OK';
  } catch (e) {
    console.error('There was an error in deleteNotificationService: ', e);

    if (!(e instanceof Error && 'code' in e)) {
      return 'INTERNAL_ERROR';
    }

    if (e.code !== 'P2025') {
      return 'NOT_FOUND';
    }

    return 'INTERNAL_ERROR';
  }
};

export default deleteNotificationService;
