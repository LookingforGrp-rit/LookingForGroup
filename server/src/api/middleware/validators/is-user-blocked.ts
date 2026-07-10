import type { ApiResponse } from '@looking-for-group/shared';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { userIsOnBlocklistService } from '#services/me/blocklist/user-is-on-blocklist.ts';

type ParameterLocation = 'path' | 'body';

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
    let rawTargetId;
    switch (targetParamLocation) {
      case 'body':
        rawTargetId = (request.body as Record<string, unknown>)[targetKey] as string;
        break;
      case 'path':
        rawTargetId = request.params[targetKey] as string;
        break;
    }

    const targetId = parseInt(rawTargetId);
    if (isNaN(targetId)) {
      res.status = 400;
      res.error = 'Invalid user id.';
      response.status(res.status).json(res);
      return;
    }

    // Initiator Id
    let rawInitiatorId;
    switch (initiatorParamLocation) {
      case 'body':
        rawInitiatorId = (request.body as Record<string, unknown>)[initiatorKey] as string;
        break;
      case 'path':
        rawInitiatorId = request.params[initiatorKey] as string;
        break;
    }

    const initiatorId = parseInt(rawInitiatorId);
    if (isNaN(initiatorId)) {
      res.status = 400;
      res.error = 'Invalid user id.';
      response.status(res.status).json(res);
      return;
    }

    // CHECKING IF THE INITATOR USER IS BLOCKED BY THE TARGET USER //
    const result = await userIsOnBlocklistService(initiatorId, targetId);

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
