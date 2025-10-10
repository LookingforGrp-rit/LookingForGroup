import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import reorderImagesService from '#services/projects/images/reorder-images.ts';

//an array of the imageIds of each of the images in their new order
type ImageOrder = {
  imageOrder?: number[];
};

//reorders the images in a project
const reorderImagesController = async (req: Request, res: Response): Promise<void> => {
  const imageOrder: ImageOrder = req.body as ImageOrder;

  const projId = parseInt(req.params.id);

  const result = await reorderImagesService(projId, imageOrder);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Image not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  res.status(200).json({ success: true });
};

export default reorderImagesController;
