import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { loginService } from '#services/authentication/login.ts';

export const login = async (request: Request, response: Response) => {
  if (!request.body) {
    console.log('Endpoint /api/google-login threw an error: Missing credentials.');
    const resBody: ApiResponse = {
      status: 400,
      error: 'Missing Credential',
      data: null,
    };
    return response.status(400).json(resBody);
  }

  // eslint-disable-next-line
  const userData = await loginService(request.body.credential); //since it returns the user's existence
  if (userData === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    return response.status(500).json(resBody);
  }

  if (userData === 'BAD_REQUEST') {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Email missing or invalid (An RIT account is required)',
      data: null,
    };
    return response.status(400).json(resBody);
  }

  if (userData === 'FORBIDDEN') {
    const resBody: ApiResponse = {
      status: 403,
      error: 'User blacklisted from LFG',
      data: null,
    };
    return response.status(403).json(resBody);
  }

  request.session.gid = userData.googleId || '';
  request.session.data = JSON.stringify(userData);

  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      userExists: userData.userExists,
    }, //{userExists: true/false} for the frontend's use, but the frontend also wants the name and email for display
  };
  return response.status(200).json(resBody); //now frontend can get it
  //i notice that this is routed to /google-login so it wouldn't handle all the other logins
};
