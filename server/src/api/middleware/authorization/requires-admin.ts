import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { NextFunction, Response } from 'express';

const requiresAdmin = (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
  //current user ID
  const user = request.currentUser;

  const forbiddenResBody: ApiResponse = {
    status: 403,
    error: 'Administrator required for this resource',
    data: null,
  };

  if (user.accessLevel !== 'Administrator') {
    response.status(403).json(forbiddenResBody);
    return;
  }

  next();
};

export default requiresAdmin;
