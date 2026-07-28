import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import getProjectImagesService from '#services/me/gallery/get-images.ts';

//GET api/me/gallery/{userId}/images
//gets the images in gallery
const getGalleryImagesController = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.userId as string);

  const result = await getProjectImagesService(userId);

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
      error: 'User not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};

export default getGalleryImagesController;
