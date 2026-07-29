import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import deleteGalleryVideoService from '#services/me/gallery/delete-video.ts';

//DELETE api/me/{UserId}/gallery/videos/{videoId}
//deletes a video from gallery
const deleteGalleryVideoController = async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const videoId = parseInt(req.params.videoId as string);

  //delete the video from the gallery
  const result = await deleteGalleryVideoService(userId, videoId);

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
      error: 'Video Not Found',
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

export default deleteGalleryVideoController;
