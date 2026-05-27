import type { CreateUserInput, MePrivate } from '@looking-for-group/shared';
import { OAuth2Client } from 'google-auth-library';
import prisma from '#config/prisma.ts';
import { PrismaClientKnownRequestError } from '#prisma-models/runtime/library.js';
import { MePrivateSelector } from '#services/selectors/me/me-private.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMeToPrivate } from '#services/transformers/me/me-private.ts';

type CreateUserServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'CONFLICT' | 'BAD_REQUEST'>;

type CreateUserServiceParameters = Omit<CreateUserInput, 'googleId' | 'username'> & {
  username: string;
  googleId: string;
};

const createUserService = async (
  info: CreateUserServiceParameters,
): Promise<MePrivate | CreateUserServiceError> => {
  try {
    //if there are no google credentials by now we're in dev, since we already have the checks in the controller
    //so bypass the google stuff and create the dev user directly from here
    if (!info.googleCredentials) {
      const result = await prisma.users.create({
        data: info,
        select: MePrivateSelector,
      });
      return transformMeToPrivate(result);
    }

    const { googleCredentials, ...userData } = info;

    //if we do have google credentials go do a google
    const client = new OAuth2Client();
    // asking google to verify the token
    // and then getting info about the user.
    const ticket = await client.verifyIdToken({
      idToken: googleCredentials,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    //escort the payload
    const payload = ticket.getPayload();
    if (!payload || !payload.given_name || !payload.family_name || !payload.sub || !payload.email)
      return 'INTERNAL_ERROR'; //when would this ever happen? google's down or something? i guess

    //populate info object with the payload information
    userData.firstName = payload.given_name;
    userData.lastName = payload.family_name;
    userData.ritEmail = payload.email;
    userData.googleId = payload.sub;
    userData.username = payload.email.substring(0, payload.email.indexOf('@'));

    //now we have to take the googleCredentials out of the user data thing
    //with this uh destructuring assignment or something this is new to me
    //i used this: https://www.codemzy.com/blog/copying-object-without-property-javascript
    //but it's giving me an unused property error, whatever man it works
    //CURSE YOU LINTER
    console.log(userData);

    const result = await prisma.users.create({
      data: userData,
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
