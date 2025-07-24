import type { ApiResponse } from '@looking-for-group/shared';
import type { RequestHandler } from 'express';
import type { UsersAcademicYear } from '#prisma-models/index.js';
import { updateUserInfoService } from '#services/users/update-info.ts';

interface UpdateUserInfo {
  firstName?: string;
  lastName?: string;
  headline?: string;
  pronouns?: string;
  jobTitleId?: number;
  majorId?: number;
  academic_year?: UsersAcademicYear | null;
  location?: string;
  funFact?: string;
  bio?: string;
}

export const updateUserInfo: RequestHandler<{ id: string }, unknown, UpdateUserInfo> = async (
  req,
  res,
) => {
  const { id } = req.params;
  const updates = req.body;

  //validate ID
  const userId = parseInt(id);
  if (isNaN(userId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
      memetype: 'application/json',
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
    'jobTitleId',
    'majorId',
    'academic_year',
    'location',
    'funFact',
    'bio',
  ];

  //validate update fields
  const invalid = Object.keys(updates).filter((field) => !updateFields.includes(field));

  if (invalid.length > 0) {
    const resBody: ApiResponse = {
      status: 400,
      error: `Invalid fields: ${JSON.stringify(invalid)}`,
      data: null,
      memetype: 'application/json',
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await updateUserInfoService(userId, updates);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'User not found',
      data: null,
      memetype: 'application/json',
    };
    res.status(404).json(resBody);
    return;
  }
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

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
    memetype: 'application/json',
  };
  res.status(200).json(resBody);
};
