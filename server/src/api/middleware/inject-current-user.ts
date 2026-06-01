import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { NextFunction, Request, Response } from 'express';
import envConfig from '#config/env.ts';
import type { UserData } from '#services/authentication/login.ts';
import { getUserByGoogleService } from '#services/me/get-user-google.ts';

const injectCurrentUser = async (request: Request, response: Response, next: NextFunction) => {
  const authenticatedRequest = request as AuthenticatedRequest;
  const userData: UserData = JSON.parse(request.session.data || '') as UserData;

  if (envConfig.env === 'development' || envConfig.env === 'test') {
    /// Add currentUser for development
    const devId = request.query.devId as string | undefined;

    if (devId) {
      authenticatedRequest.currentUser = parseInt(devId);
      next();
      return;
    }
  }

  const googleId = userData.google_id;

  //if no google id found
  if (!googleId) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Missing ID in headers',
      data: null,
    };
    response.status(400).json(resBody);
    return;
  }

  const result = await getUserByGoogleService(googleId);

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
