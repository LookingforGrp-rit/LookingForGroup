import type { AddProjectTagInput, ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import addTagService from '#services/projects/tags/add-tag.ts';

//POST api/projects/{id}/tags
//adds a tag to the project
const addTagsController = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
  const tag: AddProjectTagInput = req.body as AddProjectTagInput;

  const result = await addTagService(projectId, tag);

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
    data: result,
  };
  res.status(200).json(resBody);
};

export default addTagsController;
