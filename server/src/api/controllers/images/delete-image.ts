// ONLY TO BE USED FOR TESTING

import type { Request, Response } from 'express';
import { deleteImageService } from '#services/images/delete-image.ts';

export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  if (!req.params.image) {
    res.status(400).send();
    return;
  }

  const result = await deleteImageService(req.params.image);
  res.status(200).json({ result });
};
