import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { deleteTagsService } from '#services/projects/delete-tags.ts';

const deleteTagsController = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const tagId = parseInt(req.params.tagId);

  //add the image to the project
  const result = await deleteTagsService(id, tagId);

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

export default deleteTagsController;
