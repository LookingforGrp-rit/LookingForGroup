import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import type { UsersAcademicYear } from '#prisma-models/index.js';
import { uploadImageService } from '#services/images/upload-image.ts';
import { updateUserInfoService } from '#services/me/update-info.ts';
import { getUserByUsernameService } from '#services/users/get-user/get-by-username.ts';

interface UpdateUserInfo {
  firstName?: string;
  lastName?: string;
  headline?: string;
  pronouns?: string;
  title?: string;
  academicYear?: UsersAcademicYear | null;
  location?: string;
  funFact?: string;
  bio?: string;
  visibility?: number;
  username?: string;
  phoneNumber?: string;
  profileImage?: string;
  mentor?: '0' | '1';
}

//update user info
export const updateUserInfo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.currentUser;
  const updates = req.body as UpdateUserInfo;

  //validate ID
  const userId = parseInt(id);
  if (isNaN(userId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  //fields that can be updated
  const updateFields = [
    'firstName',
    'lastName',
    'headline',
    'pronouns',
    'title',
    'academicYear',
    'location',
    'funFact',
    'bio',
    'visibility',
    'username',
    'phoneNumber',
    'profileImage',
    'mentor',
  ];

  //validate update fields
  const invalid = Object.keys(updates).filter((field) => !updateFields.includes(field));

  if (invalid.length > 0) {
    const resBody: ApiResponse = {
      status: 400,
      error: `Invalid fields: ${JSON.stringify(invalid)}`,
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  //check if username was updated, and only do this whole check if it was
  const newUsername = updates['username'];
  if (newUsername) {
    const userExist = await getUserByUsernameService(newUsername);
    if (
      userExist !== 'NOT_FOUND' &&
      userExist !== 'INTERNAL_ERROR' &&
      userExist.userId !== userId
    ) {
      const resBody: ApiResponse = {
        status: 409,
        error: 'Username already taken',
        data: null,
      };
      res.status(409).json(resBody);
      return;
    }
  }

  //check if they sent over a new pfp, and upload it to the db
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

    updates['profileImage'] = dbImage.location;
  }

  const result = await updateUserInfoService(userId, {
    ...updates,
    mentor: updates.mentor ? parseInt(updates.mentor) : undefined,
  });

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'User not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }
  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};
