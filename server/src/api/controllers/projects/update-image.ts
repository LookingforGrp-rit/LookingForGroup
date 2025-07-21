import type { RequestHandler } from 'express';
import getService from '#services/projects/update-image.ts';

interface UpdateImageInfo {
  url?: string;
  description?: string;
  isThumbnail?: boolean;
}

const updateImageController: RequestHandler<{ id: string }, unknown, UpdateImageInfo> = async (
  req,
  res
): Promise<void> => {
  const { id } = req.params;
  const updates: object = req.body;

  const imageId = parseInt(id);
  if (isNaN(imageId)) {
    res.status(400).json({ message: 'Invalid image ID' });
    return;
  }

  const allowedFields = ['url', 'description', 'isThumbnail'];
  const invalidFields = Object.keys(updates).filter((field) => !allowedFields.includes(field));

  if (invalidFields.length > 0) {
    res.status(400).json({ message: `Invalid fields: ${JSON.stringify(invalidFields)}` });
    return;
  }

  const result = await getService(imageId, updates);

  if (result === 'NOT_FOUND') {
    res.status(404).json({ message: 'Image not found' });
    return;
  }

  if (result === 'INTERNAL_ERROR') {
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }

  res.status(200).json({ success: true });
};

export default updateImageController;
