import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { NextFunction, Response } from 'express';
import type { ParameterLocation } from '#middleware/validators/parameter-location/parameter-location.ts';

/**
 * Checks if the subject of the action being performed is the same person as the one performing the action.
 *  (e.g. moderator approving their own project)
 * @param subjectParamLocations A map of parameter keys ("id", "userId", etc) to parameter locations (path, body, etc.)
 */
export const requiresNotSelf = (subjectParamLocations: Map<ParameterLocation, string>) => {
  return async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    // Getting all ids
    const promises: Promise<number[] | ApiResponse>[] = [];

    subjectParamLocations.forEach((value, key) => {
      promises.push(key.getId(value, request));
    });

    const ids = await Promise.all(promises);

    // Checking all results
    const meId = request.currentUser.userId;
    let success = true;

    ids.forEach((subjectResult) => {
      if (!success) return;

      if ('status' in subjectResult) {
        response.status(subjectResult.status).json(subjectResult);
        success = false;
        return;
      }

      // This is typically just one id, but in some cases (e.g. looking through a list of project members)
      //      we have to loop through an array.
      subjectResult.forEach((id) => {
        if (meId === id) {
          const res: ApiResponse = {
            status: 403,
            error: 'You cannot do this yourself.',
          };
          response.status(res.status).json(res);
          success = false;
          return;
        }
      });
    });

    // yeah i don't know why it does this. It should theoretically sometimes be true.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!success) return;

    next();
  };
};
