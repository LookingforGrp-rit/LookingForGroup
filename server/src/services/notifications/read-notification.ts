import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type ReadNotificationServiceError = ServiceErrorSubset<'NOT_FOUND' | 'INTERNAL_ERROR'>;
type ReadNotificationServiceSuccess = ServiceSuccessSubset<'OK'>;

const readNotificationService = async (
  notificationId: string,
  receiverId: number,
): Promise<ReadNotificationServiceError | ReadNotificationServiceSuccess> => {
  try {
    await prisma.notifications.update({
      where: {
        notificationId,
        receiverId,
      },
      data: {
        hasBeenRead: true,
      },
    });

    return 'OK';
  } catch (e) {
    console.error('There has been an error in readNotificationService: ', e);

    if (!(e instanceof Object && 'code' in e)) {
      return 'INTERNAL_ERROR';
    }

    if (e.code === 'P2025') {
      return 'NOT_FOUND';
    } else {
      return 'INTERNAL_ERROR';
    }
  }
};

export default readNotificationService;
