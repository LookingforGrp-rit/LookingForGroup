import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import getProjectFollowersService from '#services/projects/get-project-followers.ts';

// gets the people following a project
export const getProjectFollowers = async (req: Request, res: Response): Promise<void> => {
  //user ID
  const projectId = parseInt(req.params.id);

  //check if ID is number
  if (isNaN(projectId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await getProjectFollowersService(projectId);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Project not found',
      data: null,
    };
    res.status(404).json(resBody);
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

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};
