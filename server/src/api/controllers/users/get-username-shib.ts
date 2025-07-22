import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { uidHeaderKey } from '#config/constants.ts';
import { getUserByhibService } from '#services/users/get-user-shib.ts';

//get username by shibbolth
export const getUsernameByShib = async (req: Request, res: Response): Promise<void> => {
  const universityId = req.headers[uidHeaderKey] as string | undefined;

  //if no university id found
  if (!universityId) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Missing university ID in headers',
      data: null,
      memetype: 'application/json',
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await getUserByhibService(universityId);

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
