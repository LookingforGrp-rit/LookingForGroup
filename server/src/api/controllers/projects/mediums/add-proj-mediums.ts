import type { AddProjectMediumsInput, ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import addMediumsService from '#services/projects/mediums/add-proj-mediums.ts';

//POST api/projects/{id}/mediums
//add a medium to the project
const addMediumsController = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data: AddProjectMediumsInput = req.body as AddProjectMediumsInput;

  const result = await addMediumsService(id, data);

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
      error: 'Medium not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};

export default addMediumsController;
