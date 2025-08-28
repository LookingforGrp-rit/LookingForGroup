import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import {
  uidHeaderKey,
  firstNameHeaderKey,
  lastNameHeaderKey,
  emailHeaderKey,
} from '#config/constants.ts';
import envConfig from '#config/env.ts';
import createUserService from '#services/users/create-user.ts';
import { getUserByUsernameService } from '#services/users/get-by-username.ts';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  let uid = parseInt(req.headers[uidHeaderKey] as string);
  let firstName = req.headers[firstNameHeaderKey] as string | undefined;
  let lastName = req.headers[lastNameHeaderKey] as string;
  let email = req.headers[emailHeaderKey] as string;

  if (envConfig.env === 'development' || envConfig.env === 'test') {
    /// Fudge for development
    const devFirstName = req.query.devFirstName as string | undefined;
    const devLastName = req.query.devLastName as string | undefined;
    const devEmail = req.query.devEmail as string | undefined;
    const devUID = parseInt(req.query.devUID as string);

    if (devFirstName) {
      firstName = devFirstName;
    }

    if (devLastName) {
      lastName = devLastName;
    }

    if (devEmail) {
      email = devEmail;
    }

    if (devUID && !isNaN(devUID)) {
      uid = devUID;
    }
  }

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

  const data = req.body as { username: string };
  const username = data.username;

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
