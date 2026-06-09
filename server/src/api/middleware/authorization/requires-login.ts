import type { ApiResponse, SessionUserData } from '@looking-for-group/shared';
import type { NextFunction, Request, Response } from 'express';
import { uidHeaderKey } from '#config/constants.ts';
import envConfig from '#config/env.ts';

const requiresLogin = (request: Request, response: Response, next: NextFunction) => {
  if (envConfig.env === 'development' || envConfig.env === 'test') {
    /// Add UID for development, missing correct header
    request.headers[uidHeaderKey] = '000000001';

    next();
    return;
  }
  const userData: SessionUserData = JSON.parse(request.session.data || '{}') as SessionUserData;

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
