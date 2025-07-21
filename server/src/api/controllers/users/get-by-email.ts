import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { getUserByEmailService } from '#services/users/get-by-email.ts';

//get the user by the email
export const getUserByEmail = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.params;

  const result = await getUserByEmailService(email);

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

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'User not found',
      data: null,
      memetype: 'application/json',
    };
    res.status(404).json(resBody);
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
