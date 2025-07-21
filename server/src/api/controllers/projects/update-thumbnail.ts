import type { RequestHandler } from 'express';
import getService from '#services/projects/update-thumb.ts';

interface UpdateProjectInfo {
  thumbnail?: string;
}

const updateThumbnailController: RequestHandler<
  { id: string },
  unknown,
  UpdateProjectInfo
> = async (req, res): Promise<void> => {
  const { id } = req.params;
  const updates: object = req.body;

  //validate ID
  const projectId = parseInt(id);
  if (isNaN(projectId)) {
    res.status(400).json({ message: 'Invalid project ID' });
    return;
  }

  const updateFields = ['thumbnail'];

  //validate update fields
  const invalid = Object.keys(updates).filter((field) => !updateFields.includes(field));

  if (invalid.length > 0) {
    res.status(400).json({ message: `Invalid fields: ${JSON.stringify(invalid)}` });
    return;
  }

  const result = await getService(projectId, updates);

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

export default updateThumbnailController;
