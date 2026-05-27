import { type NextFunction, type Request, type Response } from 'express';
import { loginService } from '#services/authentication/login.ts';

export const login = async (request: Request, response: Response, next: NextFunction) => {
  if (!request.body) {
    console.log('Endpoint [TODO: INSERT ENDPOINT] threw an error: Missing credentials.');
    return response.status(400).json({ error: 'Missing Credential' });
  }

  try {
    await loginService(request.params.credentials);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }

  next();
};
