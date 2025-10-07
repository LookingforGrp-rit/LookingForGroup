import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { NextFunction, Request, Response } from 'express';
import { uidHeaderKey } from '#config/constants.ts';
import envConfig from '#config/env.ts';
import { getUserByShibService } from '#services/me/get-user-shib.ts';

const injectCurrentUser = async (request: Request, response: Response, next: NextFunction) => {
  const authenticatedRequest = request as AuthenticatedRequest;

  if (envConfig.env === 'development' || envConfig.env === 'test') {
    /// Add currentUser for development
    const devId = request.query.devId as number | undefined;

    if (devId) {
      authenticatedRequest.currentUser = devId;
      next();
      return;
    }
  }

  const universityId = authenticatedRequest.headers[uidHeaderKey] as string | undefined;

  //if no university id found
  if (!universityId) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Missing university ID in headers',
      data: null,
    };
    response.status(400).json(resBody);
    return;
  }

  const result = await getUserByShibService(universityId);

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
      error: 'User not found',
      data: null,
    };
    response.status(404).json(resBody);
    return;
  }

  const userID = result.userId;
  authenticatedRequest.currentUser = userID;
  next();
};

export default injectCurrentUser;
