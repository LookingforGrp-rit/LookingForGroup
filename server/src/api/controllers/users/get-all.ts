import type { ApiResponse, FilterRequest, UserFilters } from '@looking-for-group/shared';
import type { Response } from 'express';
import { getAllUsersService } from '#services/users/get-all-users.ts';

//get all users
export const getAllUsers = async (req: FilterRequest, res: Response): Promise<void> => {
  const filters = req.query as UserFilters;

  const result = await getAllUsersService(filters);

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
