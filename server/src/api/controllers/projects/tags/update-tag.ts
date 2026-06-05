import type { UpdateProjectTagInput, ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import updateTagService from '#services/projects/tags/update-tag.ts';

//PATCH api/projects/{id}/tags/{tagId}
//updates a tag for the project
const updateTagController = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
  const tagId = parseInt(req.params.tagId);
  const tag: UpdateProjectTagInput = req.body as UpdateProjectTagInput;

  const result = await updateTagService(projectId, tagId, tag);

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
      data: result,
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

export default updateTagController;
