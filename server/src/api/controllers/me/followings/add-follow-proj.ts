import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { addProjectFollowingService } from '#services/me/followings/add-follow-proj.ts';

//POST api/me/followings/projects/{id}
//add project to follow list
export const addProjectFollowing = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const projectId = parseInt(req.params.id);

  const result = await addProjectFollowingService(req.currentUser, projectId);

  if (result === 'CONFLICT') {
    const resBody: ApiResponse = {
      status: 409,
      error: 'Already following project',
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
      error: 'Project not found',
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
