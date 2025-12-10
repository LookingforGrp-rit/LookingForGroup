import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import getService from '#services/projects/get-proj-id.ts';

//GET api/projects/{id}
//gets a project by its id
const getProjectByIDController = async (req: Request, res: Response): Promise<void> => {
  const projID = parseInt(req.params.id);

  const result = await getService(projID);

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
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};

export default getProjectByIDController;
