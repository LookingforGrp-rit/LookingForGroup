import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import warnUserService from '#services/users/blacklist/warn-user.ts';

//PUT api/mod/send-warning/{userID}
//Issues a warning to a user
export const sendWarning = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = await warnUserService(req);

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

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'User Not Found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

  const resBody: ApiResponse = {
    status: 201,
    error: null,
    data: null,
  };
  res.status(201).json(resBody);
};
