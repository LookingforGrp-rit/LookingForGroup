import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { loginService } from '#services/authentication/login.ts';

export const login = async (request: Request, response: Response) => {
  if (!request.body) {
    console.log('Endpoint [TODO: INSERT ENDPOINT] threw an error: Missing credentials.');
    const resBody: ApiResponse = {
      status: 400,
      error: 'Missing Credential',
      data: null,
    };
    return response.status(400).json(resBody);
  }

  const userExists = await loginService(request.params.credentials); //since it returns the user's existence

  if (userExists === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    return response.status(500).json(resBody);
  }

  if (userExists === 'BAD_REQUEST') {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Email missing or invalid',
      data: null,
    };
    return response.status(400).json(resBody);
  }

  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: { userExists }, //{userExists: true/false} for the frontend's use
  };
  return response.status(200).json(resBody); //now frontend can get it
  //i notice that this is routed to /google-login so it wouldn't handle all the other logins
};
