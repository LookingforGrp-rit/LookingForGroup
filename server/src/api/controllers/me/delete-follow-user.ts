import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { deleteUserFollowService } from '#services/me/delete-follow-user.ts';

// delete a user from follow list
export const deleteUserFollowing = async (req: Request, res: Response): Promise<void> => {
  if (req.currentUser === undefined) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
      memetype: 'application/json',
    };
    res.status(400).json(resBody);
    return;
  }

  const userId = parseInt(req.currentUser);
  const followingId = parseInt(req.params.id);

  //validate input
  if (isNaN(userId) || isNaN(followingId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user IDs',
      data: null,
      memetype: 'application/json',
    };
    res.status(400).json(resBody);
    return;
  }

  //call service
  const result = await deleteUserFollowService(userId, followingId);

  //internal error
  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'User is not already followed',
      data: null,
      memetype: 'application/json',
    };
    res.status(404).json(resBody);
    return;
  }

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
  const resBody: ApiResponse<null> = {
    status: 200,
    error: null,
    data: null,
    memetype: 'application/json',
  };
  res.status(200).json(resBody);
};
