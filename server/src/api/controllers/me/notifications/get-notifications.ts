import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import getNotificationsService from '#services/notifications/get-notifications.ts';

export const getNotifications = async (
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> => {
  const result = await getNotificationsService(request.currentUser.userId);

  if (result === 'INTERNAL_ERROR') {
    const res: ApiResponse = {
      status: 500,
      error: 'Internal Error',
      data: null,
    };
    response.status(500).json(res);
    return;
  }

  const res: ApiResponse = {
    status: 200,
    error: null,
    data: result,
  };
  response.status(200).json(res);
};
