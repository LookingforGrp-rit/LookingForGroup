import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import getService from '#services/projects/get-paginated-projects.ts';

//GET api/projects/:count/:id
//gets 10 projects
const getPaginatedProjectsController = async (req: Request, res: Response): Promise<void> => {
  const count = parseInt(req.params.count);
  const projectId = parseInt(req.params.id);
  const result = await getService(count, projectId);

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

export default getPaginatedProjectsController;
