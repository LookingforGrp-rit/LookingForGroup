import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import type { Prisma } from '#prisma-models/index.js';
import { uploadImageService } from '#services/images/upload-image.ts';
import addImageService from '#services/projects/add-image.ts';

//adds an image to the project
const addImageController = async (req: Request, res: Response) => {
  if (!(req.body as { altText: string }).altText) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Missing alt text',
      data: null,
      memetype: 'application/json',
    };
    res.status(400).json(resBody);
    return;
  }

  //check if they send a file
  if (!req.file) {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Image file not found',
      data: null,
      memetype: 'application/json',
    };
    res.status(404).json(resBody);
    return;
  }

  //upload the file to the db
  const dbResult = await uploadImageService(
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype,
  );

  if (dbResult === 'CONTENT_TOO_LARGE') {
    const resBody: ApiResponse = {
      status: 413,
      error: 'Image too large',
      data: null,
      memetype: 'application/json',
    };
    res.status(413).json(resBody);
    return;
  }
  if (dbResult === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
      memetype: 'application/json',
    };
    res.status(500).json(resBody);
    return;
  }

  const data: Prisma.ProjectImagesCreateInput = {
    image: dbResult.location,
    altText: (req.body as { altText: string }).altText,
    position: 0,
    projects: {
      connect: {
        projectId: parseInt(req.params.id),
      },
    },
  };

  //add the image to the project
  const result = await addImageService(data);

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
      memetype: 'application/json',
    };
    res.status(500).json(resBody);
    return;
  }

  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: result,
    memetype: 'application/json',
  };
  res.status(200).json(resBody);
};

export default addImageController;
