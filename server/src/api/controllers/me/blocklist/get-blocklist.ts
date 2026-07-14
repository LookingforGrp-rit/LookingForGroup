import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { getBlocklistService } from '#services/me/blocklist/get-blocklist.ts';

export const getBlocklist = async (
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> => {
  const userId = request.currentUser.userId;
  const res: ApiResponse = { status: 0 };

  const result = await getBlocklistService(userId);

  if (result === 'INTERNAL_ERROR') {
    res.status = 500;
    res.error = 'There was an internal error.';
  } else {
    res.status = 200;
    res.data = result;
  }

  response.status(res.status).json(res);
};
