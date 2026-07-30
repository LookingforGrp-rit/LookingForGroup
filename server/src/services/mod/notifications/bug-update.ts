import type { AuthenticatedRequest } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { BugUpdateNotificationBuilder } from '#notification-templates/bug-update-notification.ts';
import sendNotificationService from '#services/notifications/send-notification.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type NotificationServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;
type NotificationServiceSuccess = ServiceSuccessSubset<'CREATED'>;

//POST api/mod/notification
const sendBugUpdateService = async (
  req: AuthenticatedRequest,
): Promise<NotificationServiceError | NotificationServiceSuccess> => {
  try {
    const reportId = parseInt(req.params.id as string);

    //check if report exists
    const report = await prisma.reportBug.findUnique({
      where: {
        reportId,
      },
    });

    if (report === null) return 'NOT_FOUND';

    // Create notification
    const result = await sendNotificationService(new BugUpdateNotificationBuilder(), req);
    if (result !== 'CREATED') return result;

    return 'CREATED';
  } catch (e) {
    console.error('Error in sendBugUpdateService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default sendBugUpdateService;
