// ONLY TO BE USED FOR TESTING

import type { Request, Response } from 'express';
import { uploadImageService } from '#services/images/upload-image.ts';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  if (!req.file?.buffer) {
    res.status(400).send();
    return;
  }

  const result = await uploadImageService(req.file.buffer, 'test.png', 'image/png');
  res.status(200).json({ result });
};
