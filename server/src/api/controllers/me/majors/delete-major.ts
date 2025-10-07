import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { deleteMajorService } from '#services/me/majors/delete-major.ts';

//delete a major from user profile
export const deleteMajor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  //the one you're deleting
  const major = parseInt(req.params.id);

  const result = await deleteMajorService(major, req.currentUser);

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  const resBody: ApiResponse<null> = {
    status: 200,
    error: null,
    data: null,
  };
  res.status(200).json(resBody);
};
