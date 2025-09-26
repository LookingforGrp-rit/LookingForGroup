import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { updateUserInfoService } from '#services/me/update-info.ts';

interface ClearUserInfo {
  firstName?: string;
  lastName?: string;
  headline?: string;
  pronouns?: string;
  title?: string;
  location?: string;
  funFact?: string;
  bio?: string;
  profileImage?: string;
}

//clear a selected user profile
export const clearProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id; //the id of the user whose profile must be cleareds
  const clearing = {
    firstName: 'David',
    lastName: 'Munson',
    headline: '',
    pronouns: '',
    title: '',
    location: '',
    funFact: '',
    bio: '',
    profileImage: '',
  } as ClearUserInfo;

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

  const result = await updateUserInfoService(userId, clearing);

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
