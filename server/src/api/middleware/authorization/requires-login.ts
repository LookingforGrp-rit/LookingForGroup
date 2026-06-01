import type { ApiResponse } from '@looking-for-group/shared';
import type { NextFunction, Request, Response } from 'express';
import { uidHeaderKey } from '#config/constants.ts';
import envConfig from '#config/env.ts';
import type { UserData } from '#services/authentication/login.ts';

const requiresLogin = (request: Request, response: Response, next: NextFunction) => {
  if (envConfig.env === 'development' || envConfig.env === 'test') {
    /// Add UID for development, missing correct header
    request.headers[uidHeaderKey] = '000000001';

    next();
    return;
  }
  const userData: UserData = JSON.parse(request.session.data || '') as UserData;

  if (userData.userExists) {
    next();
    return;
  }

  const resBody: ApiResponse = {
    status: 401,
    error: 'User not logged in',
    data: null,
  };
  response.status(401).json(resBody);
  return;
};

export default requiresLogin;
