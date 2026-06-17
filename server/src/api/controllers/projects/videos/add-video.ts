import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import type { Prisma } from '#prisma-models/index.js';
import addVideoService from '#services/projects/videos/add-video.ts';

//POST api/projects/{id}/videos
//adds a video to the project
const addVideoController = async (req: Request, res: Response) => {
  console.log(req.body);
  const data: Prisma.ProjectVideosCreateInput = {
    videoUrl: (req.body as { videoUrl: string }).videoUrl,
    title: (req.body as { title: string }).title,
    position: 0,
    projects: {
      connect: {
        projectId: parseInt(req.params.id),
      },
    },
  };

  //add the video to the project
  const result = await addVideoService(data);

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
      error: 'Project Not Found',
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

export default addVideoController;
