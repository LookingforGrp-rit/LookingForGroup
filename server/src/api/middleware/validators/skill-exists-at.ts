import { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import { NextFunction, Response } from 'express';
import getSkillService from '#services/datasets/get-skill.ts';

type ParameterLocation = 'path' | 'body';

export const skillExistsAt = (location: ParameterLocation, key: string) => {
  return async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    let rawSkillId;
    const res: ApiResponse = { status: 0 };

    switch (location) {
      case 'body':
        rawSkillId = (request.body as Record<string, unknown>)[key] as string;
        break;
      case 'path':
        rawSkillId = request.params[key] as string;
        break;
    }

    const skillId = parseInt(rawSkillId);

    if (isNaN(skillId)) {
      res.status = 400;
      res.error = 'Invalid skill ID';
      response.status(res.status).json(res);
      return;
    }

    const result = await getSkillService(skillId);

    if (result === 'NOT_FOUND') {
      res.status = 404;
      res.error = 'Skill not found.';
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
