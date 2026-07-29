import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import type { Prisma } from '#prisma-models/index.js';
import { uploadImageService } from '#services/images/upload-image.ts';
import addGalleryImageService from '#services/me/gallery/add-image.ts';

//POST api/me/gallery/{userId}/images
//adds an image to a users gallery
const addGalleryImageController = async (req: AuthenticatedRequest, res: Response) => {
  const { altText } = req.body as { altText?: string };
  const userId = Number(req.params.userId);

  //check if alt text was added
  if (!altText) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Missing alt text',
      data: null,
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
    };
    res.status(413).json(resBody);
    return;
  }
  if (dbResult === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  const data: Prisma.GalleryImagesCreateInput = {
    image: dbResult.location,
    altText: (req.body as { altText: string }).altText,
    position: 0,
    user: {
      connect: {
        userId,
      },
    },
  };

  //add the image to the project
  const result = await addGalleryImageService(data);

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
    status: 201,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};

export default addGalleryImageController;
