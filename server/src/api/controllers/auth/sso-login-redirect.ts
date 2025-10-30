//this file should pertain to shibboleth and processes the users/service creation of an understanding of shibboleth schema

import type { Request, Response } from 'express';
import {
  emailHeaderKey,
  firstNameHeaderKey,
  lastNameHeaderKey,
  uidHeaderKey,
  isLoggedInHeaderKey,
} from '#config/constants.ts';
import { upsertUserFromShib } from '#services/users/upsert-from-shib.ts';

const ssoLoginRedirectController = async (request: Request, response: Response) => {
  const isLoggedIn = request.headers[isLoggedInHeaderKey] === 'true';
  const uidHeader = request.headers[uidHeaderKey] as string | undefined;
  const fNameHeader = request.headers[firstNameHeaderKey] as string | undefined;
  const lNameHeader = request.headers[lastNameHeaderKey] as string | undefined;
  const emailHeader = request.headers[emailHeaderKey] as string | undefined;

  // If proxy did not inject headers, redirect to login entry.
  if (!isLoggedIn || !uidHeader || !fNameHeader || !lNameHeader || !emailHeader) {
    response.redirect('/login');
    return;
  }

  try {
    const result = await upsertUserFromShib({
      universityId: uidHeader,
      givenName: fNameHeader,
      sn: lNameHeader,
      mail: emailHeader,
    });

    if (result === 'INTERNAL_ERROR') {
      response.redirect('/logout');
      return;
    }

    // Redirect to the SPA root or a target path query param
    const target = (request.query.target as string | undefined) ?? '/';
    response.redirect(target);
    return;
  } catch {
    response.redirect('/login');
    return;
  }
};

export default ssoLoginRedirectController;
