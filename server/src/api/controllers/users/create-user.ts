import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import {
  uidHeaderKey,
  firstNameHeaderKey,
  lastNameHeaderKey,
  emailHeaderKey,
} from '#config/constants.ts';
import createUserService from '#services/users/create-user.ts';
import { getUserByUsernameService } from '#services/users/get-by-username.ts';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const uid = parseInt(req.headers[uidHeaderKey] as string);
  const firstName = req.headers[firstNameHeaderKey] as string | undefined;
  const lastName = req.headers[lastNameHeaderKey] as string;
  const email = req.headers[emailHeaderKey] as string;

  if (!uid || !firstName || !lastName || !email) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Missing information in headers',
      data: null,
      memetype: 'application/json',
    };
    res.status(400).json(resBody);
    return;
  }

  const username = req.params.username;

  const userExist = await getUserByUsernameService(username);
  if (userExist !== 'NOT_FOUND' && userExist !== 'INTERNAL_ERROR' && userExist.userId !== uid) {
    const resBody: ApiResponse = {
      status: 409,
      error: 'Username already taken',
      data: null,
      memetype: 'application/json',
    };
    res.status(409).json(resBody);
    return;
  }

  const result = await createUserService(uid, username, firstName, lastName, email);

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
      memetype: 'application/json',
    };
    res.status(500).json(resBody);
    return;
  }

  if (result === 'CONFLICT') {
    const resBody: ApiResponse = {
      status: 409,
      error: 'User already exists',
      data: null,
      memetype: 'application/json',
    };
    res.status(409).json(resBody);
    return;
  }

  const resBody: ApiResponse<typeof result> = {
    status: 201,
    error: null,
    data: result,
    memetype: 'application/json',
  };
  res.status(201).json(resBody);
};
