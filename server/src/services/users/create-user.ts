import type { MePrivate } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { PrismaClientKnownRequestError } from '#prisma-models/runtime/library.js';
import { MePrivateSelector } from '#services/selectors/me/me-private.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMeToPrivate } from '#services/transformers/me/me-private.ts';

type CreateUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'CONFLICT'>;

export const createUserService = async (
  uid: string,
  username: string,
  firstName: string,
  lastName: string,
  email: string,
): Promise<MePrivate | CreateUserServiceError> => {
  try {
    const result = await prisma.users.create({
      data: {
        universityId: uid,
        username: username,
        firstName,
        lastName,
        ritEmail: email,
      },
      select: MePrivateSelector,
    });

    return transformMeToPrivate(result);
  } catch (e) {
    console.error(`Error in createUserService: ${JSON.stringify(e)}`);

    if (e instanceof PrismaClientKnownRequestError) {
      switch (e.code) {
        case 'P2002':
          return 'CONFLICT';
        default:
          return 'INTERNAL_ERROR';
      }
    }

    return 'INTERNAL_ERROR';
  }
};
