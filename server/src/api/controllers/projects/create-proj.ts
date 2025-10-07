import type {
  ApiResponse,
  AuthenticatedRequest,
  CreateProjectInput,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import { uploadImageService } from '#services/images/upload-image.ts';
import createProjectService from '#services/projects/create-proj.ts';

//creates a project
const createProjectController = async (req: AuthenticatedRequest, res: Response) => {
  const inputData: Omit<CreateProjectInput, 'thumbnail'> = req.body as Omit<
    CreateProjectInput,
    'thumbnail'
  >;
  let thumbnailUrl: string | undefined;

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
    thumbnailUrl = dbImage.location;
  }

  const result = await createProjectService(inputData, req.currentUser, thumbnailUrl);

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
