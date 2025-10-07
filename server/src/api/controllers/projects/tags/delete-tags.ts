import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { deleteTagsService } from '#services/projects/tags/delete-tags.ts';

//deletes multiple tags from a project
const deleteTagsController = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const tag = parseInt(req.params.tagId);

  const result = await deleteTagsService(id, tag);

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
      error: 'Tag not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }
  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: null,
  };
  res.status(200).json(resBody);
};

export default deleteTagsController;
