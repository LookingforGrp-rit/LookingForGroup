import type { ApiResponse, AuthenticatedRequest, UpdateUserInput } from '@looking-for-group/shared';
import type { Response } from 'express';
import { uploadImageService } from '#services/images/upload-image.ts';
import { updateUserInfoService } from '#services/me/update-info.ts';

type RequestBody = Partial<Omit<UpdateUserInput, 'profileImage'>>;

//PATCH api/me
//update user info
export const updateUserInfo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const body = req.body as RequestBody;

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
    'phoneNumber',
    'mentor',
  ];

  //validate update fields
  const invalid = Object.keys(body).filter((field) => !updateFields.includes(field));

  if (invalid.length > 0) {
    const resBody: ApiResponse = {
      status: 400,
      error: `Invalid fields: ${JSON.stringify(invalid)}`,
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  const updates: Parameters<typeof updateUserInfoService>[1] = {
    ...body,
    mentor: undefined,
    visibility: undefined,
  };

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

    updates.profileImage = dbImage.location;
  }

  if (body.mentor !== undefined) {
    updates.mentor = body.mentor === 'true';
  }

  if (body.visibility !== undefined) {
    updates.visibility = body.visibility === '1' ? 1 : 0;
  }

  const result = await updateUserInfoService(req.currentUser, updates);

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
