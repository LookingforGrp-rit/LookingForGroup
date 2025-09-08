import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import getProjectImagesService from '#services/projects/get-proj-images.ts';

//gets the images associated with a project
const getProjectImagesController = async (_req: Request, res: Response): Promise<void> => {
  const projID = parseInt(_req.params.id);

  if (isNaN(projID)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid project ID',
      data: null,
      memetype: 'application/json',
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await getProjectImagesService(projID);

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
      error: 'Project not found',
      data: null,
      memetype: 'application/json',
    };
    res.status(404).json(resBody);
    return;
  }

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
    memetype: 'application/json',
  };
  res.status(200).json(resBody);
};

export default getProjectImagesController;
