/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import type { Prisma, ProjectsPurpose, ProjectsStatus } from '#prisma-models/index.js';
import { uploadImageService } from '#services/images/upload-image.ts';
import createProjectService from '#services/projects/create-proj.ts';

//creates a project
const createProjectController = async (req: AuthenticatedRequest, res: Response) => {
  const userId = parseInt(req.currentUser);

  if (isNaN(userId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }
  const data: Prisma.ProjectsCreateInput = {
    title: req.body.title as string,
    hook: req.body.hook as string,
    description: req.body.description as string,
    thumbnail: req.body.thumbnail as string,
    purpose: req.body.purpose as ProjectsPurpose,
    status: req.body.status as ProjectsStatus,
    audience: req.body.audience as string,
    users: {
      connect: {
        userId: req.body.userId as number,
      },
    },
  };

  //thumbnail handling
  if (req.file) {
    const dbImage = await uploadImageService(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );

    if (dbImage === 'CONTENT_TOO_LARGE') {
      const resBody: ApiResponse = {
        status: 413,
        error: 'Image too large',
        data: null,
      };
      res.status(413).json(resBody);
      return;
    }

    if (dbImage === 'INTERNAL_ERROR') {
      const resBody: ApiResponse = {
        status: 500,
        error: 'Internal Server Error',
        data: null,
      };
      res.status(500).json(resBody);
      return;
    }
    data.thumbnail = dbImage.location;
  }

  const result = await createProjectService(data);

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};

export default createProjectController;
