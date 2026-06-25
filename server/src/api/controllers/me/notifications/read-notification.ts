import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import readNotificationService from '#services/notifications/read-notification.ts';

export const readNotification = async (
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> => {
  const result = await readNotificationService(
    request.params.id as string,
    request.currentUser.userId,
  );
  const res: ApiResponse = { status: 0 };

  if (result === 'INTERNAL_ERROR') {
    res.status = 500;
    res.error = 'Internal Server Error';
  } else if (result === 'NOT_FOUND') {
    res.status = 404;
    res.error = 'Notification not found for user';
  } else {
    res.status = 200;
    res.data = 'Notification marked as read';
  }

  response.status(res.status).json(res);
};
