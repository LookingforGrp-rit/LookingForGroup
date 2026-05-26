import type { CreateUserInput, MePrivate } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { PrismaClientKnownRequestError } from '#prisma-models/runtime/library.js';
import { MePrivateSelector } from '#services/selectors/me/me-private.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMeToPrivate } from '#services/transformers/me/me-private.ts';

type CreateUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'CONFLICT'>;

const createUserService = async (
  uid: string,
  username: string,
  info: CreateUserInput,
): Promise<MePrivate | CreateUserServiceError> => {
  try {
    const result = await prisma.users.create({
      data: {
        googleId: uid,
        username,
        firstName: info.firstName ?? '',
        lastName: info.lastName ?? '',
        ritEmail: info.ritEmail ?? '',
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

export default createUserService;
