import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { deleteUserFollowService } from '#services/me/followings/delete-follow-user.ts';

// delete a user from follow list
export const deleteUserFollowing = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const userId = parseInt(req.currentUser);
  const followingId = parseInt(req.params.id);

  //validate input
  if (isNaN(userId) || isNaN(followingId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user IDs',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  //call service
  const result = await deleteUserFollowService(userId, followingId);

  //not found
  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'User is not already followed',
      data: null,
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
    };
    res.status(500).json(resBody);
    return;
  }

  //passed
  const resBody: ApiResponse<null> = {
    status: 200,
    error: null,
    data: null,
  };
  res.status(200).json(resBody);
};
