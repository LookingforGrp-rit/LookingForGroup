import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { getUnapprovedProjectByIdService } from '#services/projects/approval/get-unapproved-proj-id.ts';

const getUnapprovedProjectByIdController = async (request: Request, response: Response) => {
  const projectId = parseInt(request.params.id as string);
  const result = await getUnapprovedProjectByIdService(projectId);

  if (result === 'INTERNAL_ERROR') {
    const res: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    response.status(500).json(res);
    return;
  }

  if (result === 'NOT_FOUND') {
    const res: ApiResponse = {
      status: 404,
      error: 'Project has been approved or does not exist',
      data: null,
    };
    response.status(404).json(res);
    return;
  }

  const res: ApiResponse = {
    status: 200,
    error: null,
    data: result,
  };
  response.status(200).json(res);
};

export default getUnapprovedProjectByIdController;
