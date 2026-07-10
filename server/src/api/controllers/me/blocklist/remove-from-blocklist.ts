import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { removeFromBlocklistService } from '#services/me/blocklist/remove-from-blocklist.ts';

export const removeFromBlocklist = async (
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> => {
  type RemoveFromBlocklistInput = {
    userId: number;
  };

  const res: ApiResponse = { status: 0 };
  const blockerId = request.currentUser.userId;
  const body = request.body as RemoveFromBlocklistInput;
  const blockedId = body.userId;

  if (!blockedId) {
    res.status = 400;
    res.error = 'User ID for blocked user not provided.';
    response.status(res.status).json(res);
    return;
  }

  const result = await removeFromBlocklistService(blockerId, blockedId);

  if (result === 'CONFLICT') {
    res.status = 409;
    res.error = 'User is not in blocklist.';
  } else if (result === 'INTERNAL_ERROR') {
    res.status = 500;
    res.error = 'There was an internal error.';
  } else {
    res.status = 204;
    res.data = 'User removed from blocklist.';
  }

  response.status(res.status).json(res);
};
