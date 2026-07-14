import type { ApiResponse } from '@looking-for-group/shared';
import type { Request } from 'express';

/**
 * The location where an ID can be found.
 */
export interface ParameterLocation {
  /**
   * Gets the ID from the parameter location.
   * @param key The key to retrieve the ID.
   * @returns The ID if everything goes well or an API response if there is some sort of failure.
   */
  getId(key: string, request: Request): Promise<number | ApiResponse>;
}
