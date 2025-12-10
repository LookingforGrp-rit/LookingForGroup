import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { getUserProjectsService } from '#services/users/get-user-proj.ts';

//GET api/users/{id}/projects
// gets the projects of another user to view
export const getOtherUserProjects = async (req: Request, res: Response): Promise<void> => {
  //current user ID
  const UserId = parseInt(req.params.id);

  const result = await getUserProjectsService(UserId);

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
      error: 'No projects for this user or user private',
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
