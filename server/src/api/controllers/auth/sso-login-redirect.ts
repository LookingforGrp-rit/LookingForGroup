import type { Request, Response } from 'express';
import {
  emailHeaderKey,
  firstNameHeaderKey,
  lastNameHeaderKey,
  uidHeaderKey,
} from '#config/constants.ts';
import createUserService from '#services/users/create-user.ts';

const ssoLoginRedirectController = async (request: Request, response: Response) => {
  const uidHeader = request.headers[uidHeaderKey] as string | undefined;
  const fNameHeader = request.headers[firstNameHeaderKey] as string | undefined;
  const lNameHeader = request.headers[lastNameHeaderKey] as string | undefined;
  const emailHeader = request.headers[emailHeaderKey] as string | undefined;

  if (!uidHeader || !fNameHeader || !lNameHeader || !emailHeader) {
    response.redirect('/login');
    return;
  }

  try {
    const uid = Number.parseInt(uidHeader, 10);

    const result = await createUserService(uid, fNameHeader, lNameHeader, emailHeader);

    if (result === 'INTERNAL_ERROR') {
      response.redirect('/logout');
      return;
    }

    /// If we want to send them somewhere if their account was just made
    /// we can put it here
    // if (result !== 'CONFLICT') {
    // }

    /// We should have front end send some data so
    /// when logging in to redirect them back to the page they were on
    response.redirect('/');
    return;
  } catch {
    response.redirect('/login');
    return;
  }
};

export default ssoLoginRedirectController;
