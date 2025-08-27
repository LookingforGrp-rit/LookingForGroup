import type { ApiResponse } from '@looking-for-group/shared';
import type { RequestHandler } from 'express';
import { getUserByUsernameService } from '#services/users/get-by-username.ts';
import { updateUserUsernameService } from '#services/users/update-username.ts';

export const updateUsername: RequestHandler<
  { id: string },
  unknown,
  { username?: string }
> = async (req, res) => {
  const { id } = req.params;
  const { username: newUsername } = req.body;

  //validate ID
  const userId = parseInt(id);
  if (isNaN(userId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
      memetype: 'application/json',
    };
    res.status(400).json(resBody);
    return;
  }

  //validate new username
  if (!newUsername || newUsername.trim() === '') {
    const resBody: ApiResponse = {
      status: 400,
      error: 'New username not found',
      data: null,
      memetype: 'application/json',
    };
    res.status(400).json(resBody);
    return;
  }

  //check if username exists
  const userExist = await getUserByUsernameService(newUsername);
  if (userExist !== 'NOT_FOUND' && userExist !== 'INTERNAL_ERROR' && userExist.userId !== userId) {
    const resBody: ApiResponse = {
      status: 409,
      error: 'Username already taken',
      data: null,
      memetype: 'application/json',
    };
    res.status(409).json(resBody);
    return;
  }

  //update username
  const result = await updateUserUsernameService(userId, newUsername);

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
