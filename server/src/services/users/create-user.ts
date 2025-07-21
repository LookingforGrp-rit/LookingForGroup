import prisma from '#config/prisma.ts';
import type { Users } from '#prisma-models/index.js';
import { PrismaClientKnownRequestError } from '#prisma-models/runtime/library.js';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type CreateUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'CONFLICT'>;

const createUserService = async (
  uid: number,
  firstName: string,
  lastName: string,
  email: string,
): Promise<Users | CreateUserServiceError> => {
  try {
    return await prisma.users.create({
      data: {
        universityId: uid.toString(),
        username: firstName,
        firstName,
        lastName,
        ritEmail: email,
      },
    });
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
