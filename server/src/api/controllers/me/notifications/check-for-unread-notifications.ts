import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import checkForUnreadNotificationsService from '#services/notifications/check-for-unread-notifications.ts';

export const checkForUnreadNotifications = async (
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> => {
  const result = await checkForUnreadNotificationsService(request.currentUser.userId);
  const res: ApiResponse = { status: 0 };

  if (result === 'INTERNAL_ERROR') {
    res.status = 500;
    res.error = 'Internal Server Error';
  } else if (result === 'CONFLICT') {
    res.status = 400;
    res.error = 'User no longer exists';
  } else {
    res.status = 200;
    res.data = result;
  }

  response.status(res.status).json(res);
};
