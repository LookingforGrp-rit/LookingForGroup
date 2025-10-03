import type { ApiResponse } from '@looking-for-group/shared';
import { type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import { getUserByIdService } from '#services/users/get-user/get-by-id.ts';

type ParameterLocation = 'path' | 'body';

export const projectExistsAt = (type: ParameterLocation, key: string): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let rawUserId;

    switch (type) {
      case 'path':
        rawUserId = req.params[key];
        break;
      case 'body':
        rawUserId = (req.body as Record<string, unknown>)[key] as string;
        break;
    }

    const userId = parseInt(rawUserId);

    if (isNaN(userId)) {
      const resBody: ApiResponse = {
        status: 400,
        error: 'Invalid user ID',
        data: null,
      };
      res.status(400).json(resBody);
      return;
    }

    const userQuery = await getUserByIdService(userId);

    if (userQuery === 'INTERNAL_ERROR') {
      const resBody: ApiResponse = {
        status: 500,
        error: 'Internal Server Error',
        data: null,
      };
      res.status(500).json(resBody);
      return;
    }

    if (userQuery === 'NOT_FOUND') {
      const resBody: ApiResponse = {
        status: 404,
        error: 'User not found',
        data: null,
      };
      res.status(404).json(resBody);
      return;
    }

    next();
  };
};
