import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { getImageService } from '#services/images/get-image.ts';

export const getImage = async (req: Request, res: Response): Promise<void> => {
  const key = req.params.image;

  if (!key) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Missing image key',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await getImageService(key);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Image not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Image not found',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  res.redirect(301, result.location);
};
