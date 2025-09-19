import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import type { ProjectsPurpose, ProjectsStatus } from '#prisma-models/index.js';
import { uploadImageService } from '#services/images/upload-image.ts';
import updateProjectService from '#services/projects/update-project.ts';

interface UpdateProjectInfo {
  title?: string;
  hook?: string;
  description?: string;
  purpose?: ProjectsPurpose;
  status?: ProjectsStatus;
  audience?: string;
  thumbnail?: string;
}

//updates a project's info
const updateProjectController = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
  const updates = req.body as UpdateProjectInfo;

  //validate ID
  const projectId = parseInt(id);
  if (isNaN(projectId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid project ID',
      data: null,
    };
    res.status(400).json(resBody);
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

    updates['thumbnail'] = dbImage.location;
  }

  const result = await updateProjectService(projectId, updates);

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
