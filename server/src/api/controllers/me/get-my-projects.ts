import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { getMyProjectsService } from '#services/me/get-my-projects.ts';

//get projects user owns/is a member of
export const getMyProjects = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const visibility = req.query.visibility as 'all' | 'public' | 'private' | undefined;
  const owner = req.query.owner as 'all' | 'me' | undefined;

  const result = await getMyProjectsService(req.currentUser, visibility, owner);

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
