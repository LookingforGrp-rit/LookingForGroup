import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import getMessageService from '#services/notifications/get-message.ts';

export const getMessage = async (
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> => {
  const result = await getMessageService(request.params.id as string, request.currentUser.userId);

  if (result === 'NOT_FOUND') {
    const res: ApiResponse = {
      status: 404,
      error: 'Notification not found',
      data: null,
    };
    response.status(404).json(res);
    return;
  }

  if (result === 'INTERNAL_ERROR') {
    const res: ApiResponse = {
      status: 500,
      error: 'Internal server error',
      data: null,
    };
    response.status(500).json(res);
    return;
  }

  response.set('Content-Type', 'text/html');
  response.status(200).send(result);
};
