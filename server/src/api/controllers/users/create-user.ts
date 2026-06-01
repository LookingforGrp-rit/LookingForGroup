import type {
  ApiResponse,
  CreateUserInput,
  GoogleCredentialUserInput,
  SessionUserData,
} from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import envConfig from '#config/env.ts';
import type { UserData } from '#services/authentication/login.ts';
import { uploadImageService } from '#services/images/upload-image.ts';
import createUserService from '#services/users/create-user.ts';

//POST api/users
//creates a user
//we are being sent this with all of its information (minus the name and email stuff google handles that)
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const info: GoogleCredentialUserInput = req.body as GoogleCredentialUserInput;
  const devInfo: CreateUserInput = {} as CreateUserInput;
  const sessionInfo: SessionUserData = JSON.parse(req.session.data || '') as SessionUserData;

  // This is for creating a dev user via the swagger docs
  if ((envConfig.env === 'development' || envConfig.env === 'test') && !sessionInfo.google_id) {
    /// Fudge for development
    const devFirstName = req.query.devFirstName as string | undefined;
    const devLastName = req.query.devLastName as string | undefined;
    const devEmail = req.query.devEmail as string | undefined;
    const devUID = req.query.devUID as string | undefined;

    if (devFirstName) {
      devInfo.firstName = devFirstName;
    }

    if (devLastName) {
      devInfo.lastName = devLastName;
    }

    if (devEmail) {
      devInfo.ritEmail = devEmail;
      devInfo.username = devInfo.ritEmail.substring(0, devInfo.ritEmail.indexOf('@'));
    }

    if (devUID) {
      devInfo.googleId = devUID;
    }
    const result = await createUserService(devInfo, sessionInfo);
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
    return;
  }

  //don't check for google credentials if we have dev-defined things
  //because if we have dev-defined things we're running it through swagger to test everything else aside from the google stuff
  //so this is a bit of a bypass
  //basically tryna say if we have none of the dev things check for the credentials
  if (!sessionInfo.google_id) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Missing Google credentials',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  //check if they sent over a pfp, and upload it to the db
  if (req.file) {
    const dbImage = await uploadImageService(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );

    if (dbImage === 'CONTENT_TOO_LARGE') {
      const resBody: ApiResponse = {
        status: 413,
        error: 'Image too large',
        data: null,
      };
      res.status(413).json(resBody);
      return;
    }

    if (dbImage === 'INTERNAL_ERROR') {
      const resBody: ApiResponse = {
        status: 500,
        error: 'Internal Server Error',
        data: null,
      };
      res.status(500).json(resBody);
      return;
    }

    info.profileImage = dbImage.location;
  }

  const result = await createUserService(info, sessionInfo);

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

  if (result === 'BAD_REQUEST') {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Only RIT emails are allowed',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  const resBody: ApiResponse<typeof result> = {
    status: 201,
    error: null,
    data: result,
  };
  res.status(201).json(resBody);

  // Removing user information from session because it's not needed anymore.
  const userInfo: UserData = JSON.parse(req.session.data || '') as UserData;
  userInfo.email = '';
  userInfo.firstName = '';
  userInfo.lastName = '';
  req.session.data = JSON.stringify(userInfo);
};
