import type {
  ApiResponse,
  AuthenticatedRequest,
  UpdateProjectInput,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import { uploadImageService } from '#services/images/upload-image.ts';
import updateProjectService from '#services/projects/update-proj.ts';

//updates a project's info
const updateProjectsController = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
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

  const { id } = req.params;
  const updates = req.body as Omit<UpdateProjectInput, 'thumbnail'>;
  let thumbnailUrl: string | undefined;

  //validate ID
  const projectId = parseInt(id);
  if (isNaN(projectId)) {
    res.status(400).json({ message: 'Invalid project ID' });
    return;
  }

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
    res.status(404).json({ message: 'Project not found' });
    return;
  }
  if (result === 'INTERNAL_ERROR') {
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }

  res.status(200).json(result);
};

export default updateProjectsController;
