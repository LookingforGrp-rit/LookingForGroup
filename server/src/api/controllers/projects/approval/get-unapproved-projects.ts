import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { getUnapprovedProjectsService } from '#services/projects/approval/get-unapproved-projects.ts';

const getUnapprovedProjectsController = async (_request: Request, response: Response) => {
  const result = await getUnapprovedProjectsService();

  if (result === 'INTERNAL_ERROR') {
    const res: ApiResponse = {
      status: 500,
      error: 'Internal Error',
      data: null,
    };
    response.status(500).json(res);
    return;
  }

  const res: ApiResponse = {
    status: 200,
    error: null,
    data: result,
  };
  response.status(200).json(res);
  return;
};

export default getUnapprovedProjectsController;
