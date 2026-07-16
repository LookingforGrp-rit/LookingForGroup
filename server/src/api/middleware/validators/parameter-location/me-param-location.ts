import type { ApiResponse } from '@looking-for-group/shared';
import type { Request } from 'express';
import prisma from '#config/prisma.ts';
import type { ParameterLocation } from './parameter-location.ts';

/**
 * Takes the user id from the authenticated request ('me').
 * Will return 200 if no user was found.
 */
export class MeParameterLocation implements ParameterLocation {
  async getId(_key: string, request: Request): Promise<number | ApiResponse> {
    const id = request.session.gid;
    if (id) {
      const userId = await prisma.users.findFirst({
        where: {
          googleId: id,
        },
        select: {
          userId: true,
        },
      });

      if (!userId) {
        return { status: 400 };
      }
      return userId.userId;
    }

    const res = { status: 200 };
    return res;
  }
}
