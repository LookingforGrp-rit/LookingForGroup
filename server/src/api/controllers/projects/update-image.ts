import type { ApiResponse } from '@looking-for-group/shared';
import type { RequestHandler } from 'express';
import { uploadImageService } from '#services/images/upload-image.ts';
import getService from '#services/projects/update-image.ts';

interface UpdateImageInfo {
  image?: string;
  altText?: string;
}

const updateImageController: RequestHandler<{ id: string }, unknown, UpdateImageInfo> = async (
  req,
  res,
): Promise<void> => {
  const { id } = req.params;
  const updates: UpdateImageInfo = req.body;

  const imageId = parseInt(id);
  if (isNaN(imageId)) {
    res.status(400).json({ message: 'Invalid image ID' });
    return;
  }

  const allowedFields = ['url', 'altText'];
  const invalidFields = Object.keys(updates).filter((field) => !allowedFields.includes(field));

  if (invalidFields.length > 0) {
    res.status(400).json({ message: `Invalid fields: ${JSON.stringify(invalidFields)}` });
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

    updates['image'] = dbImage.location;
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
