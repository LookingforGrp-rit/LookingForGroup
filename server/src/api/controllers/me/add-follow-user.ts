import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { addUserFollowingService } from '#services/me/add-follow-user.ts';

//add user to follow list
export const addUserFollowing = async (req: Request, res: Response): Promise<void> => {
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

  const senderId = parseInt(req.currentUser);
  const receiverId = parseInt(req.params.id);

  //validate input
  if (isNaN(senderId) || isNaN(receiverId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
      memetype: 'application/json',
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await addUserFollowingService(senderId, receiverId);

  if (result === 'FORBIDDEN') {
    const resBody: ApiResponse = {
      status: 403,
      error: 'Cannot follow self',
      data: null,
      memetype: 'application/json',
    };
    res.status(403).json(resBody);
    return;
  }

  if (result === 'CONFLICT') {
    const resBody: ApiResponse = {
      status: 409,
      error: 'Already following user',
      data: null,
      memetype: 'application/json',
    };
    res.status(409).json(resBody);
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

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'User not found/cannot follow self',
      data: null,
      memetype: 'application/json',
    };
    res.status(404).json(resBody);
    return;
  }

  const resBody: ApiResponse<typeof result> = {
    status: 201,
    error: null,
    data: result,
    memetype: 'application/json',
  };
  res.status(201).json(resBody);
};
