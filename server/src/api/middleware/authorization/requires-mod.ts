import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { NextFunction, Response } from 'express';
import envConfig from '#config/env.ts';

const requiresModerator = (
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

  const forbiddenResBody: ApiResponse = {
    status: 403,
    error: 'Invalid user ID',
    data: null,
  };

  if (!envConfig.modId) {
    response.status(403).json(forbiddenResBody);
    return;
  }

  const modId = parseInt(envConfig.modId);

  //check if mod ID is number
  if (isNaN(modId) || modId !== userId) {
    response.status(403).json(forbiddenResBody);
    return;
  }

  next();
};

export default requiresModerator;
