import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { NextFunction, Response } from 'express';
import type { ParameterLocation } from '#middleware/validators/parameter-location/parameter-location.ts';

/**
 * Checks if the subject of the action being performed is the same person as the one performing the action.
 *  (e.g. moderator approving their own project)
 */
export const requiresNotSelf = (subjectParamLocation: ParameterLocation, subjectKey: string) => {
  return async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    const subjectResult = await subjectParamLocation.getId(subjectKey, request);
    if (typeof subjectResult !== 'number') {
      response.status(subjectResult.status).json(subjectResult);
      return;
    }

    const meId = request.currentUser.userId;

    if (meId === subjectResult) {
      const res: ApiResponse = {
        status: 403,
        error: 'You cannot moderate yourself.',
      };
      response.status(res.status).json(res);
      return;
    }

    next();
  };
};
