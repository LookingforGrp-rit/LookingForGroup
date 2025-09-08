import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { deleteTagsService } from '#services/projects/delete-tags.ts';

//the tags (or their ids anyway)
type TagInputs = {
  tagIds?: number[];
};

//deletes multiple tags from a project
const deleteTagsController = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const tagData = req.body as TagInputs;

  const result = await deleteTagsService(id, tagData);

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
    data: null,
    memetype: 'application/json',
  };
  res.status(200).json(resBody);
};

export default deleteTagsController;
