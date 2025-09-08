import type { ApiResponse } from '@looking-for-group/shared';
import type { NextFunction, Request, Response } from 'express';
import getProjectByIdService from '#services/projects/get-proj-id.ts';

const requiresProjectOwner = async (request: Request, response: Response, next: NextFunction) => {
  if (request.currentUser === undefined) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
      memetype: 'application/json',
    };
    response.status(400).json(resBody);
    return;
  }

  //current user ID
  const userId = parseInt(request.currentUser);

  //check if ID is number
  if (isNaN(userId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
      memetype: 'application/json',
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
      memetype: 'application/json',
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
      memetype: 'application/json',
    };
    response.status(500).json(resBody);
    return;
  }

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Project not found',
      data: null,
      memetype: 'application/json',
    };
    response.status(404).json(resBody);
    return;
  }

  if (result.owner.userId !== userId) {
    const resBody: ApiResponse = {
      status: 403,
      error: 'Insufficient permissions',
      data: null,
      memetype: 'application/json',
    };
    response.status(403).json(resBody);
    return;
  }

  next();
};

export default requiresProjectOwner;
