import { OAuth2Client } from 'google-auth-library';

export const loginService = async (token: string) => {
  const client = new OAuth2Client();

  // asking google to verify the token
  //  and then getting info about the user.
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const email = payload?.email;

  // a# - authentication error no. #
  // a01 - authentication error no. 1
  if (!email) {
    throw new Error('a01: No Email');
  }

  if (email.indexOf('@g.rit.edu') === -1 && email.indexOf('@rit.edu') === -1) {
    throw new Error('a02: Invalid Email');
  }

  // need to check if the user exists
  // waiting for update to the database and user service to do this
  // or maybe just a direct call to the database here (that would probably be easier and make more sense).

  // Remove eslint-disable-next-line once checking logic is in place.
  // eslint-disable-next-line
  if (true /*User exists*/) {
    //
  } else {
    //
  }
};
