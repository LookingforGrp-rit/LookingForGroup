import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import addTagsService from '#services/projects/add-tags.ts';

//the tags (or their labels anyway)
type TagInputs = {
  tagIds?: number[];
};

//adds multiple tags to the project
const addTagsController = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data = req.body as TagInputs;

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

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Tags not found',
      data: null,
      memetype: 'application/json',
    };
    res.status(404).json(resBody);
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
