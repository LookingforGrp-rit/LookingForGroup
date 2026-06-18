import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type SendNotificationServiceError = ServiceErrorSubset<'CONFLICT' | 'INTERNAL_ERROR'>;
type SendNotificationServiceSuccess = ServiceSuccessSubset<'CREATED'>;

const sendNotificationService = async (
  receiverId: number,
  subjectLine: string,
  message: string,
): Promise<SendNotificationServiceError | SendNotificationServiceSuccess> => {
  // notification is created in the database
  try {
    await prisma.notifications.create({
      data: {
        receiverId,
        subjectLine,
        message,
        timeSent: Date.now().toString(),
      },
    });

    return 'CREATED';
  } catch (e) {
    console.error('There was an error in sendNotification: ', e);

    if (!(e instanceof Object && 'code' in e)) {
      return 'INTERNAL_ERROR';
    }

    if (e.code === 'P2003') {
      return 'CONFLICT';
    }

    return 'INTERNAL_ERROR';
  }
};

export default sendNotificationService;
