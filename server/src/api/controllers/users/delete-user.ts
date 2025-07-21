import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { deleteUserService } from '#services/users/delete-user.ts';

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user IDs',
      data: null,
      memetype: 'application/json',
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await deleteUserService(userId);

  //internal error
  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
      memetype: 'application/json',
    };
    res.status(500).json(resBody);
    return;
  }

  //passed
  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
    memetype: 'application/json',
  };
  res.status(200).json(resBody);
};
