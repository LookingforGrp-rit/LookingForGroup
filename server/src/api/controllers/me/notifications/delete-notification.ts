import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import deleteNotificationService from '#services/notifications/delete-notification.ts';

export const deleteNotification = async (
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> => {
  const result = await deleteNotificationService(
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
    res.status = 204;
    res.data = 'Notification deleted';
  }

  response.status(res.status).json(res);
};
