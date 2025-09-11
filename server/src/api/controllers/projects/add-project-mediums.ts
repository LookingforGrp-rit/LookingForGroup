import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import addMediumsService from '#services/projects/add-project-mediums.ts';

//the mediums (or their ids anyway)
type Mediums = {
  mediumIds?: number[];
};

//adds multiple mediums to the project
const addMediumsController = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data: Mediums = req.body as Mediums;

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
