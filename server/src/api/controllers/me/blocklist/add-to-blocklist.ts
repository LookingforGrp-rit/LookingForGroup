import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { addToBlocklistService } from '#services/me/blocklist/add-to-blocklist.ts';

export const addToBlocklist = async (
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> => {
  type AddToBlocklistInput = {
    userId?: number;
  };

  const res: ApiResponse = { status: 0 };
  const blockerId = request.currentUser.userId;
  const body = request.body as AddToBlocklistInput;
  const blockedId = body.userId;

  if (!blockedId) {
    res.status = 400;
    res.error = 'User ID for blocked user not provided.';
    response.status(res.status).json(res);
    return;
  }

  const result = await addToBlocklistService(blockerId, blockedId);

  if (result === 'CONFLICT') {
    res.status = 409;
    res.error = 'User already in blocklist.';
  } else if (result === 'INTERNAL_ERROR') {
    res.status = 500;
    res.error = 'There was an internal error.';
  } else {
    res.status = 200;
    res.data = 'User added to blocklist.';
  }

  response.status(res.status).json(res);
};
