import type {
  CreateUserInput,
  GoogleCredentialUserInput,
  MePrivate,
  SessionUserData,
} from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { PrismaClientKnownRequestError } from '#prisma-models/runtime/library.js';
import { MePrivateSelector } from '#services/selectors/me/me-private.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMeToPrivate } from '#services/transformers/me/me-private.ts';

type CreateUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'CONFLICT' | 'BAD_REQUEST'>;

const createUserService = async (
  info: GoogleCredentialUserInput,
  session: SessionUserData,
): Promise<MePrivate | CreateUserServiceError> => {
  try {
    //if there are no google credentials by now we're in dev, since we already have the checks in the controller
    //so bypass the google stuff and create the dev user directly from here
    if (!session.googleId) {
      const devData = info as CreateUserInput;
      const result = await prisma.users.create({
        data: devData,
        select: MePrivateSelector,
      });
      return transformMeToPrivate(result);
    }

    const { ...userData } = info;

    if (!session.firstName || !session.lastName || !session.email || !session.googleId) {
      return 'BAD_REQUEST';
    }

    //populate info object with the payload information
    (userData as CreateUserInput).firstName = session.firstName;
    (userData as CreateUserInput).lastName = session.lastName;
    (userData as CreateUserInput).ritEmail = session.email;
    (userData as CreateUserInput).googleId = session.googleId;
    (userData as CreateUserInput).username = session.email.substring(0, session.email.indexOf('@'));

    console.log(userData);

    const result = await prisma.users.create({
      data: userData as CreateUserInput,
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
