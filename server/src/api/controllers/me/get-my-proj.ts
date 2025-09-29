import type { ApiResponse, GetProjectsRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { getMyProjectsService } from '#services/me/get-my-proj.ts';

//get projects user owns/is a member of
export const getMyProjects = async (req: GetProjectsRequest, res: Response): Promise<void> => {
  //current user ID
  const UserId = parseInt(req.currentUser);
  const visibility = req.visibiility;
  const owner = req.owner;

  //check if ID is number
  if (isNaN(UserId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await getMyProjectsService(UserId, visibility, owner);

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
      error: 'Projects not found',
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
