import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import addTagsService from '#services/projects/add-tags.ts';

//the tags (or their labels anyway)
type Tags = {
  tags?: number[];
};

const addTagsController = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data: Tags = req.body as Tags;

  //add the image to the project
  const result = await addTagsService(id, data);

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

export default addTagsController;
