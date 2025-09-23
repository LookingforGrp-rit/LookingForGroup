import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { getTagsService } from '#services/datasets/get-tags.ts';

const getTagsController = async (_request: Request, response: Response): Promise<void> => {
  const result = await getTagsService();

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    response.status(500).json(resBody);
    return;
  }

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
  };
  response.status(200).json(resBody);
};

export default getTagsController;
