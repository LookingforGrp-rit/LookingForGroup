import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { deleteMediumsService } from '#services/projects/mediums/delete-proj-mediums.ts';

//the tags (or their ids anyway)
type MediumInputs = {
  mediumIds?: number[];
};

//deletes multiple mediums
const deleteMediumsController = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const mediumData = req.body as MediumInputs;

  //delete the mediums they passed in
  const result = await deleteMediumsService(id, mediumData);

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: null,
  };
  res.status(200).json(resBody);
};

export default deleteMediumsController;
