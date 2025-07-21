import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { getAllUsersService } from '#services/users/get-all-users.ts';

//get all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const result = await getAllUsersService();

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

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
    memetype: 'application/json',
  };
  res.status(200).json(resBody);
};
