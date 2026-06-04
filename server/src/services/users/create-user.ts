import type { CreateUserInput, MePrivate, SessionUserData } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { PrismaClientKnownRequestError } from '#prisma-models/runtime/library.js';
import { MePrivateSelector } from '#services/selectors/me/me-private.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMeToPrivate } from '#services/transformers/me/me-private.ts';

type CreateUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'CONFLICT' | 'BAD_REQUEST'>;

const createUserService = async (
  userData: CreateUserInput,
  session: SessionUserData,
): Promise<MePrivate | CreateUserServiceError> => {
  try {
    //destructure to take majors out of userData
    //because you have to connect it individually
    const { majors, ...majorlessUserData } = userData;
    //if there are no google credentials by now we're in dev, since we already have the checks in the controller
    //so bypass the google stuff and create the dev user directly from here
    if (!session.googleId) {
      const devData = userData;
      const { majors, ...majorlessDevData } = devData;
      let result;
      if (devData.majors.length !== 0) {
        result = await prisma.users.create({
          data: {
            ...devData,
            majors: {
              connect: {
                majorId: majors[0].majorId,
              },
            },
          },
          select: MePrivateSelector,
        });
      } else {
        result = await prisma.users.create({
          data: majorlessDevData,
          select: MePrivateSelector,
        });
      }
      return transformMeToPrivate(result);
    }

    if (!session.firstName || !session.lastName || !session.email || !session.googleId) {
      return 'BAD_REQUEST';
    }

    //populate info object with the payload information
    userData.firstName = session.firstName;
    userData.lastName = session.lastName;
    userData.ritEmail = session.email;
    userData.googleId = session.googleId;
    userData.username = session.email.substring(0, session.email.indexOf('@'));

    console.log(userData);

    //majors are a relation so i gotta do this for em
    const result = await prisma.users.create({
      data: {
        ...majorlessUserData,
        majors: {
          connect: {
            majorId: majors[0].majorId,
          },
        },
      },
      select: MePrivateSelector,
    });

    return transformMeToPrivate(result);
  } catch (e) {
    console.log(e);
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
