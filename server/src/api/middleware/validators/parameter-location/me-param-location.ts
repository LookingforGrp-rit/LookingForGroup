import type { ApiResponse } from '@looking-for-group/shared';
import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import type { ParameterLocation } from './parameter-location.ts';

/**
 * Takes the user id from the authenticated request ('me').
 */
export class MeParameterLocation implements ParameterLocation {
  async getId(_key: string, request: Request): Promise<number[] | ApiResponse> {
    const meGid = request.session.gid;
    if (!meGid) {
      return { status: 200 };
    }

    try {
      const meUid = await prisma.users.findFirst({
        where: { googleId: meGid },
        select: { userId: true },
      });

      return [meUid?.userId as number];
    } catch (e) {
      console.error('There was an error in MeParameterLocation: ', e);
      return {
        status: 500,
        error: 'Internal error.',
      };
    }
  }
}
