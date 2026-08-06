import type { ApiResponse, AuthenticatedRequest, SessionUserData } from '@looking-for-group/shared';
import type { Response } from 'express';
import { getUserByGoogleService } from '#services/me/get-user-google.ts';

//GET api/me/get-username
//get username by googleAuth
//this probably won't be used
//we have some code for implementing googleAuth but we weren't allowed to use it
//and we were working on an alternative for user sign in
export const getUsernameByGoogle = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const googleId: string = (JSON.parse(req.session.data || '') as SessionUserData).googleId || '';

  //if no university id found
  if (!googleId) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Missing ID in headers',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await getUserByGoogleService(googleId);

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
      error: 'User not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};
