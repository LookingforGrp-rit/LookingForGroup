import type {
  AuthenticatedRequest,
  ApiResponse,
  UpdateProjectImageInput,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import { uploadImageService } from '#services/images/upload-image.ts';
import updateImageService from '#services/projects/images/update-image.ts';

//updates an image in a project
const updateImageController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const updates: UpdateProjectImageInput = req.body as UpdateProjectImageInput;

  const imageId = parseInt(req.params.id);

  const allowedFields = ['image', 'altText'];
  const invalidFields = Object.keys(updates).filter((field) => !allowedFields.includes(field));

  if (invalidFields.length > 0) {
    const resBody: ApiResponse = {
      status: 400,
      error: `Invalid fields: ${JSON.stringify(invalidFields)}`,
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  //check if they sent over a new image, and upload it to the db
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

    updates.image = req.file as unknown as File;
  }

  const result = await updateImageService(imageId, updates);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Image not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

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

export default updateImageController;
