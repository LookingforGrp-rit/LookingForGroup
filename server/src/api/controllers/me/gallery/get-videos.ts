import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import getGalleryVideosService from '#services/me/gallery/get-videos.ts';

//GET api/me/gallery/{userId}/videos
//adds a video to the project
const getGalleryVideoController = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId as string);

  //add the video to current users gallery
  const result = await getGalleryVideosService(userId);

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
      error: 'User Not Found',
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

export default getGalleryVideoController;
