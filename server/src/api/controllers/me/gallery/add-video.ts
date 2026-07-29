import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import type { Prisma } from '#prisma-models/index.js';
import addGalleryVideoService from '#services/me/gallery/add-video.ts';

//POST api/me/gallery/{userId}/videos
//adds a video to the users gallery
const addGalleryVideoController = async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.params.userId);

  const data: Prisma.GalleryVideosCreateInput = {
    videoUrl: (req.body as { videoUrl: string }).videoUrl,
    title: (req.body as { title: string }).title,
    position: 0,
    user: {
      connect: {
        userId,
      },
    },
  };

  //add the video to the gallery
  const result = await addGalleryVideoService(data);

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
    status: 201,
    error: null,
    data: null,
  };
  res.status(201).json(resBody);
};

export default addGalleryVideoController;
