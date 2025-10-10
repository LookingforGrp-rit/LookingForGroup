import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { getProjectFollowingService } from '#services/users/followings/get-proj-following.ts';

// gets the projects a user is following
export const getProjectsFollowing = async (req: Request, res: Response): Promise<void> => {
  //user ID
  const userId = parseInt(req.params.id);

  const result = await getProjectFollowingService(userId);

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
      error: 'No projects followed',
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
