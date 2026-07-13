import type { ApiResponse } from '@looking-for-group/shared';
import type { Request } from 'express';
import type { ParameterLocation } from './parameter-location.ts';

/**
 * Looks for the ID in the body.
 */
export class BodyParameterLocation implements ParameterLocation {
  getId(key: string, request: Request): number | ApiResponse {
    const res: ApiResponse = { status: 0 };

    const rawTargetId = (request.body as Record<string, unknown>)[key] as string;

    const targetId = parseInt(rawTargetId);
    if (isNaN(targetId)) {
      res.status = 400;
      res.error = 'Invalid user id.';
      return res;
    }

    return targetId;
  }
}
