import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { NextFunction, Response } from 'express';
import getTagService from '#services/datasets/get-tag.ts';

type ParameterLocation = 'path' | 'body';

export const tagExistsAt = (location: ParameterLocation, key: string) => {
  return async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    let rawTagId;
    const res: ApiResponse = { status: 0 };

    switch (location) {
      case 'body':
        rawTagId = (request.body as Record<string, unknown>)[key] as string;
        break;
      case 'path':
        rawTagId = request.params[key] as string;
        break;
    }

    const tagId = parseInt(rawTagId);

    if (isNaN(tagId)) {
      res.status = 400;
      res.error = 'Invalid tag ID';
      response.status(res.status).json(res);
      return;
    }

    const result = await getTagService(tagId);

    if (result === 'NOT_FOUND') {
      res.status = 404;
      res.error = 'Tag not found.';
    } else if (result === 'INTERNAL_ERROR') {
      res.status = 500;
      res.error = 'There was an internal error';
    }

    if (res.status === 0) {
      next();
    } else {
      response.status(res.status).json(res);
      return;
    }
  };
};
