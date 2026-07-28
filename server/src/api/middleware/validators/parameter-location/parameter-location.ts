import type { ApiResponse } from '@looking-for-group/shared';
import type { Request } from 'express';

/**
 * The location where an ID can be found.
 */
export interface ParameterLocation {
  /**
   * Gets the ID from the parameter location.
   * @param key The key to retrieve the ID.
   * @returns A list of IDs (or just one id in an array) if everything is as it should be,
   *          or an ApiResponse if not. Typically, this method will only return one ID as in
   *          most cases there is only one id to look for. However, there are some instances,
   *          like looking through a project's member list, where there are multiple IDs to
   *          look through.
   */
  getId(key: string, request: Request): Promise<number[] | ApiResponse>;
}
