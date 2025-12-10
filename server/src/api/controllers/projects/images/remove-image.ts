import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { removeImageService } from '#services/projects/images/remove-image.ts';

//DELETE api/projects/{id}/images{imageId}
//removes an image from a project
const removeImageController = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
  const imageId = parseInt(req.params.imageId);

  const result = await removeImageService(projectId, imageId);

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
      error: 'Image not found',
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

export default removeImageController;
