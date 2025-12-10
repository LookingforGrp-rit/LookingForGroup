import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { deleteUserService } from '#services/me/delete-user.ts';

//DELETE api/me
//delete your own account
//not for general user deletion, you can only delete an account if you're signed in as it
//...maybe we should've had one for general user deletion too?
export const deleteUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = await deleteUserService(req.currentUser);

  //internal error
  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'User not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }
  //passed
  const resBody: ApiResponse<null> = {
    status: 200,
    error: null,
    data: null,
  };
  res.status(200).json(resBody);
};
