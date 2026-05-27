import { OAuth2Client } from 'google-auth-library';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type LoginServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'BAD_REQUEST'>;

export const loginService = async (token: string): Promise<boolean | LoginServiceError> => {
  const client = new OAuth2Client();

  // asking google to verify the token
  //  and then getting info about the user.
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const email = payload?.email;
  const googleId = payload?.sub;

  //these are definitely 400 type errors so i'll send em up to frontend to handle for consistency's sake
  if (!email || (email.indexOf('@g.rit.edu') === -1 && email.indexOf('@rit.edu') === -1)) {
    return 'BAD_REQUEST'; //for consistency with the others
  }

  //prisma check for user existence
  const userExists = await prisma.users.findFirst({
    where: {
      googleId,
    },
  });

  //🍪 creation code goes here (or in the controller, whichever makes more sense but i think putting in the service makes more sense)

  if (!userExists) {
    //- loginService stores the necessary information in session storage (email, name, etc, google id)
    //so uh do that in here
  }
  //it returns the truth value, which would correspond to whether or not they exist
  return Boolean(userExists);
};
