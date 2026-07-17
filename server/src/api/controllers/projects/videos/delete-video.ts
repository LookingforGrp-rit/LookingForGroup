import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import deleteVideoService from '#services/projects/videos/delete-video.ts';

//DELETE api/projects/{id}/videos/{videoId}
//adds a video to the project
const getVideoController = async (req: Request, res: Response) => {
  const videoId = parseInt(req.params.videoId as string);
  //add the video to the project
  const result = await deleteVideoService(videoId);

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

export default getVideoController;
