import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { addProjectFollowingService } from '#services/users/add-follow-proj.ts';

//add project to follow list
export const addProjectFollowing = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.id);
  const projectId = parseInt(req.params.followId);

  //validate input
  if (isNaN(userId) || isNaN(projectId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user ID or project ID',
      data: null,
      memetype: 'application/json',
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await addProjectFollowingService(userId, projectId);

  if (result === 'CONFLICT') {
    const resBody: ApiResponse = {
      status: 409,
      error: 'Alredy following project',
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
      error: 'User not found',
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
