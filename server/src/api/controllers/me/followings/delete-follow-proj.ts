import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { deleteProjectFollowService } from '#services/me/followings/delete-follow-proj.ts';

// delete a project from follow list
export const deleteProjectFollowing = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const projectId = parseInt(req.params.id);

  //call service
  const result = await deleteProjectFollowService(req.currentUser, projectId);

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

  //not found
  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Project is not already followed',
      data: null,
    };
    res.status(404).json(resBody);
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
