import type { ApiResponse } from '@looking-for-group/shared';
import type { RequestHandler } from 'express';
import type { ProjectsPurpose, ProjectsStatus } from '#prisma-models/index.js';
import { uploadImageService } from '#services/images/upload-image.ts';
import updateProjectService from '#services/projects/update-proj.ts';

interface UpdateProjectInfo {
  title?: string;
  hook?: string;
  description?: string;
  purpose?: ProjectsPurpose;
  status?: ProjectsStatus;
  audience?: string;
  projectTags?: object;
  jobs?: object;
  members?: object;
  projectSocials?: object;
  thumbnail?: string;
}

const updateProjectsController: RequestHandler<{ id: string }, unknown, UpdateProjectInfo> = async (
  req,
  res,
): Promise<void> => {
  const { id } = req.params;
  const updates = req.body;

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
    'projectTags',
    'jobs',
    'members',
    'projectSocials',
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
        memetype: 'application/json',
      };
      res.status(413).json(resBody);
      return;
    }

    if (dbImage === 'INTERNAL_ERROR') {
      const resBody: ApiResponse = {
        status: 500,
        error: 'Internal Server Error',
        data: null,
        memetype: 'application/json',
      };
      res.status(500).json(resBody);
      return;
    }

    updates['thumbnail'] = dbImage.location;
  }

  const result = await updateProjectService(projectId, updates);

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
