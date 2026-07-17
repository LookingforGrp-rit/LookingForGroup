import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import addBlacklistService from '#services/users/blacklist/add-to-blacklist.ts';

//PUT api/mod/ban-user/{googleId}/{reason}
//bans a user, by logging them out, then adding them to a blacklist to prevent signing in
export const banUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const googleId: string = req.params.googleId as string;
  const reason: string = req.params.reason as string;

  //TODO: Implement log out

  const result = await addBlacklistService(req.currentUser.userId, googleId, reason);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'User not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }
  if (result === 'CONFLICT') {
    const resBody: ApiResponse = {
      status: 409,
      error: 'User already in blacklist',
      data: null,
    };
    res.status(409).json(resBody);
    return;
  }
  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: null,
  };
  res.status(200).json(resBody);
};
