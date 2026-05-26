import { type NextFunction, type Request, type Response } from 'express';
import { authenticationService } from '#services/authentication/authenticate.ts';

export const authenticate = async (request: Request, response: Response, next: NextFunction) => {
  if (!request.body) {
    console.log('Endpoint [TODO: INSERT ENDPOINT] threw an error: Missing credentials.');
    return response.status(400).json({ error: 'Missing Credential' });
  }

  try {
    await authenticationService(request.params.credentials);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }

  next();
};
