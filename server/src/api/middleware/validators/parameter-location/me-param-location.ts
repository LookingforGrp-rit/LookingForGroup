import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Request } from 'express';
import type { ParameterLocation } from './parameter-location.ts';

/**
 * Takes the user id from the authenticated request ('me').
 */
export class MeParameterLocation implements ParameterLocation {
  // eslint-disable-next-line @typescript-eslint/require-await
  async getId(_key: string, request: Request): Promise<number | ApiResponse> {
    const authRequest: AuthenticatedRequest = request as AuthenticatedRequest;
    return authRequest.currentUser.userId;
  }
}
