import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import getNotificationService from '#services/notifications/get-notification.ts';

export const getNotification = async (
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> => {
  const result = await getNotificationService(request.params.id as string);

  if (result === 'NOT_FOUND') {
    const res: ApiResponse = {
      status: 404,
      error: 'Notification not found.',
      data: null,
    };
    response.status(404).json(res);
    return;
  }

  if (result === 'INTERNAL_ERROR') {
    const res: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
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
