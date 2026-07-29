import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { deleteGalleryImageService } from '#services/me/gallery/delete-image.ts';

//DELETE api/me/{userId}/gallery/images/{imageId}
//removes an image from a gallery
const removeGalleryImageController = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId as string);
  const imageId = parseInt(req.params.imageId as string);

  const result = await deleteGalleryImageService(userId, imageId);

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

export default removeGalleryImageController;
