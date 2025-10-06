import type { AddProjectTagsInput, ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import addTagsService from '#services/projects/tags/add-tags.ts';

//adds multiple tags to the project
const addTagsController = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
  const tag = req.body as AddProjectTagsInput;

  const result = await addTagsService(projectId, tag);

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
      error: 'Tags not found',
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

export default addTagsController;
