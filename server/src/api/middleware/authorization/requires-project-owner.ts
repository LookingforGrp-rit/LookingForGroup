import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { NextFunction, Response } from 'express';
import getProjectByIdService from '#services/projects/get-proj-id.ts';

const requiresProjectOwner = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) => {
  //current user ID
  const userId = request.currentUser;

  //check if ID is number
  if (isNaN(userId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
    };
    response.status(400).json(resBody);
    return;
  }

  const projectId = parseInt(request.params.id);

  //check if project id is number
  if (isNaN(projectId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid project ID',
      data: null,
    };
    response.status(400).json(resBody);
    return;
  }

  const result = await getProjectByIdService(projectId);

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    response.status(500).json(resBody);
    return;
  }

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Project not found',
      data: null,
    };
    response.status(404).json(resBody);
    return;
  }

  if (result.owner.userId !== userId) {
    const resBody: ApiResponse = {
      status: 403,
      error: 'Insufficient permissions',
      data: null,
    };
    response.status(403).json(resBody);
    return;
  }

  next();
};

export default requiresProjectOwner;
