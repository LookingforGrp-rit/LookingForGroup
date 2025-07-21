import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { deleteUserFollowService } from '#services/users/delete-follow-user.ts';

// delete a user from follow list
export const deleteUserFollowing = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.id);
  const followingId = parseInt(req.params.followId);

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
