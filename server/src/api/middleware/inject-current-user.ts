import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { NextFunction, Request, Response } from 'express';
import envConfig from '#config/env.ts';
//import type { UserData } from '#services/authentication/login.ts';
import { getUserAccessLevel } from '#services/authentication/get-user-access-level.ts';
import { getUserByGoogleService } from '#services/me/get-user-google.ts';

const injectCurrentUser = async (request: Request, response: Response, next: NextFunction) => {
  const authenticatedRequest = request as AuthenticatedRequest;

  if (envConfig.env === 'development' || envConfig.env === 'test') {
    /// Add currentUser for development
    const devId = request.query.devId as string | undefined;

    if (devId) {
      const accessLevel = await getUserAccessLevel(parseInt(devId));

      if (accessLevel === 'NOT_FOUND') {
        const resBody: ApiResponse = {
          status: 404,
          error: 'User does not exist',
          data: null,
        };
        response.status(404).json(resBody);
        return;
      }

      if (accessLevel === 'INTERNAL_ERROR') {
        const resBody: ApiResponse = {
          status: 500,
          error: 'Internal Error',
          data: null,
        };
        response.status(500).json(resBody);
        return;
      }

      authenticatedRequest.currentUser = {
        username: 'DEV',
        userId: parseInt(devId),
        accessLevel: accessLevel,
      };
      next();
      return;
    }
  }

  const googleId = request.session.gid;

  //if no google id found
  if (!googleId) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Missing Google ID in session store',
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
      status: 401,
      error: 'User not found',
      data: null,
    };
    response.status(401).json(resBody);
    return;
  }

  authenticatedRequest.currentUser = result;
  request.session.touch();
  next();
};

export default injectCurrentUser;
