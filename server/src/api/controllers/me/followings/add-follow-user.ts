import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { addUserFollowingService } from '#services/me/followings/add-follow-user.ts';

//add user to follow list
export const addUserFollowing = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const senderId = req.currentUser; //keeping this redundant definition bc it has semantic meaning
  const receiverId = parseInt(req.params.id);

  const result = await addUserFollowingService(senderId, receiverId);

  if (result === 'FORBIDDEN') {
    const resBody: ApiResponse = {
      status: 403,
      error: 'Cannot follow self',
      data: null,
    };
    res.status(403).json(resBody);
    return;
  }

  if (result === 'CONFLICT') {
    const resBody: ApiResponse = {
      status: 409,
      error: 'Already following user',
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
      error: 'User not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

  const resBody: ApiResponse<typeof result> = {
    status: 201,
    error: null,
    data: result,
  };
  res.status(201).json(resBody);
};
