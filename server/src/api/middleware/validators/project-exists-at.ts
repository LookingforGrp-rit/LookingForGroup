import type { ApiResponse } from '@looking-for-group/shared';
import { type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import getProjectByIdService from '#services/projects/get-proj-id.ts';

type ParameterLocation = 'path' | 'body';

export const projectExistsAt = (type: ParameterLocation, key: string): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let rawProjectId;

    switch (type) {
      case 'path':
        rawProjectId = req.params[key];
        break;
      case 'body':
        rawProjectId = (req.body as Record<string, unknown>)[key] as string;
        break;
    }

    const projectId = parseInt(rawProjectId);

    if (isNaN(projectId)) {
      const resBody: ApiResponse = {
        status: 400,
        error: 'Invalid project ID',
        data: null,
      };
      res.status(400).json(resBody);
      return;
    }

    const projectQuery = await getProjectByIdService(projectId);

    if (projectQuery === 'INTERNAL_ERROR') {
      const resBody: ApiResponse = {
        status: 500,
        error: 'Internal Server Error',
        data: null,
      };
      res.status(500).json(resBody);
      return;
    }

    if (projectQuery === 'NOT_FOUND') {
      const resBody: ApiResponse = {
        status: 404,
        error: 'Project not found',
        data: null,
      };
      res.status(404).json(resBody);
      return;
    }

    next();
  };
};
