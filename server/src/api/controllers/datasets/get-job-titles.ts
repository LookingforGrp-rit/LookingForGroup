import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import getJobTitlesService from '#services/datasets/get-job-titles.ts';

const getJobTitlesController = async (_request: Request, response: Response): Promise<void> => {
  const result = await getJobTitlesService();

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
      memetype: 'application/json',
    };
    response.status(500).json(resBody);
    return;
  }

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
    memetype: 'application/json',
  };
  response.status(200).json(resBody);
};

export default getJobTitlesController;
