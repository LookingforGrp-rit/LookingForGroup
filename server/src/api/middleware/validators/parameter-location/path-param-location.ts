import type { ApiResponse } from '@looking-for-group/shared';
import type { Request } from 'express';
import type { ParameterLocation } from './parameter-location.ts';

/**
 * Looks for an ID in the path.
 */
export class PathParameterLocation implements ParameterLocation {
  // eslint-disable-next-line @typescript-eslint/require-await
  async getId(key: string, request: Request): Promise<number | ApiResponse> {
    const res: ApiResponse = { status: 0 };

    const rawTargetId = request.params[key] as string;

    const targetId = parseInt(rawTargetId);
    if (isNaN(targetId)) {
      res.status = 400;
      res.error = 'Invalid user id.';
      return res;
    }

    return targetId;
  }
}
