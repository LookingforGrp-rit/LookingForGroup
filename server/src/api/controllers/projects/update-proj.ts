import type {
  ApiResponse,
  AuthenticatedRequest,
  UpdateProjectInput,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import { uploadImageService } from '#services/images/upload-image.ts';
import updateProjectService from '#services/projects/update-proj.ts';

//updates a project's info
const updateProjectController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const updates = req.body as Omit<UpdateProjectInput, 'thumbnail'>;
  let thumbnailUrl: string | undefined;
  const projectId = parseInt(req.params.id);

  const updateFields = [
    'title',
    'hook',
    'description',
    'purpose',
    'status',
    'audience',
    'thumbnail',
  ];

  //validate update fields
  const invalid = Object.keys(updates).filter((field) => !updateFields.includes(field));

  if (invalid.length > 0) {
    res.status(400).json({ message: `Invalid fields: ${JSON.stringify(invalid)}` });
    return;
  }
  //check if they sent over a new pfp, and upload it to the db
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

  const result = await updateProjectService(projectId, updates, thumbnailUrl);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Project not found',
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

export default updateProjectController;
