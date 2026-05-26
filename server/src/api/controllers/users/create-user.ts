import type { ApiResponse, CreateUserInput } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import envConfig from '#config/env.ts';
import createUserService from '#services/users/create-user.ts';

//POST api/users
//creates a user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const uid = `${Math.floor(Math.random() * 1000000000)}`;
  const info: CreateUserInput = req.body as CreateUserInput;
  if (envConfig.env === 'development' || envConfig.env === 'test') {
    /// Fudge for development
    const devFirstName = req.query.devFirstName as string | undefined;
    const devLastName = req.query.devLastName as string | undefined;
    const devEmail = req.query.devEmail as string | undefined;
    const devUID = req.query.devUID as string | undefined;

    if (devFirstName) {
      info.firstName = devFirstName;
    }

    if (devLastName) {
      info.lastName = devLastName;
    }

    if (devEmail) {
      info.ritEmail = devEmail;
    }

    if (devUID) {
      info.universityId = devUID;
    }
  }

  if (!uid || !info.firstName || !info.lastName || !info.ritEmail) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Missing information in request body',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  const username = info.ritEmail.substring(0, info.ritEmail.indexOf('@'));

  const result = await createUserService(uid, username, info);

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  if (result === 'CONFLICT') {
    const resBody: ApiResponse = {
      status: 409,
      error: 'User already exists',
      data: null,
    };
    res.status(409).json(resBody);
    return;
  }

  const resBody: ApiResponse<typeof result> = {
    status: 201,
    error: null,
    data: result,
  };
  res.status(201).json(resBody);
};
