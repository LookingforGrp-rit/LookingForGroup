import type { SessionUserData } from '@looking-for-group/shared';
import { OAuth2Client } from 'google-auth-library';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import userOnBlacklistService from '#services/users/blacklist/user-on-blacklist.ts';

type LoginServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'BAD_REQUEST' | 'FORBIDDEN'>;

export const loginService = async (token: string): Promise<SessionUserData | LoginServiceError> => {
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

  if (!email || (email.indexOf('@g.rit.edu') === -1 && email.indexOf('@rit.edu') === -1)) {
    return 'BAD_REQUEST'; //for consistency with the others
  }

  if ((await userOnBlacklistService(googleId || '')) === 'OK') {
    return 'FORBIDDEN'; // no sir, not allowed.
  }

  //prisma check for user existence
  const user = await prisma.users.findFirst({
    where: {
      googleId,
    },
  });

  // Sets up data to return to the controller
  // (which it will store in the session store if the user does not exist)
  const userData: SessionUserData = {
    firstName: user?.firstName || payload.given_name || 'John',
    lastName: user?.lastName || payload.family_name || 'Doe',
    email: user?.ritEmail || email,
    googleId: user?.googleId || googleId || '0',
    userExists: Boolean(user),
  };

  return userData;
};
