import type { ApiResponse } from '@looking-for-group/shared';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { userIsOnBlocklistService } from '#services/me/blocklist/user-is-on-blocklist.ts';
import type { ParameterLocation } from './parameter-location/parameter-location.ts';

/**
 * Checks if the target user has blocked the initiator user,
 * the target user being the subject of the request (e.g. invited to a project)
 * and the initiator user being the initiator of that request (e.g. invite to a project)
 */
export const isUserBlocked = (
  targetParamLocation: ParameterLocation,
  targetKey: string,
  initiatorParamLocation: ParameterLocation,
  initiatorKey: string,
): RequestHandler => {
  return async (request: Request, response: Response, next: NextFunction) => {
    const res: ApiResponse = { status: 0 };

    // GRABBING USER IDs //
    // Target Id
    const targetResult = await targetParamLocation.getId(targetKey, request);
    if (typeof targetResult !== 'number') {
      // There was no user, but this is not a problem, so keep going.
      // 200 will be returned by MeParamLocation.getId() if there is no user.
      if (targetResult.status === 200) {
        next();
      }
      response.status(targetResult.status).json(targetResult);
      return;
    }

    const initiatorResult = await initiatorParamLocation.getId(initiatorKey, request);
    if (typeof initiatorResult !== 'number') {
      response.status(initiatorResult.status).json(initiatorResult);
      return;
    }

    // CHECKING IF THE INITATOR USER IS BLOCKED BY THE TARGET USER //
    const result = await userIsOnBlocklistService(initiatorResult, targetResult);

    if (result === 'INTERNAL_ERROR') {
      res.status = 500;
      res.error = 'There was an internal error';
      response.status(res.status).json(res);
      return;
    } else if (result) {
      res.status = 403;
      res.error = 'You are blocked by the target user.';
      response.status(res.status).json(res);
      return;
    } else {
      next();
    }
  };
};
