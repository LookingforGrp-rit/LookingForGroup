import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import deleteBlacklistService from '#services/users/blacklist/delete-from-blacklist.ts';

//delete api/mod/unban-user/{id}
//removes user from blacklist
export const unbanUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = parseInt(req.params.id);

  const result = await deleteBlacklistService(userId);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'User not found',
      data: null,
    };
    res.status(404).json(resBody);
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
