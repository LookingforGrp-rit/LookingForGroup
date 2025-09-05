import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import addMediumsService from '#services/projects/add-project-mediums.ts';

//the tags (or their labels anyway)
type Mediums = {
  mediums?: number[];
};

const addMediumsController = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data: Mediums = req.body as Mediums;

  //add the mediums to the project
  const result = await addMediumsService(id, data);

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

  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: result,
    memetype: 'application/json',
  };
  res.status(200).json(resBody);
};

export default addMediumsController;
