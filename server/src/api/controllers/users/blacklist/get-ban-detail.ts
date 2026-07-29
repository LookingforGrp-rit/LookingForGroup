import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { getBanDetailService } from '#services/users/blacklist/get-ban-detail.ts';

//GET api/users/blacklist/{id}
//Gets ban detail
export const getBanDetail = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.id as string);

  const result = await getBanDetailService(userId);

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
      error: 'User not found or user is not banned',
      data: null,
    };

    res.status(404).json(resBody);
    return;
  }

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
  };

  res.status(200).json(resBody);
  return;
};
