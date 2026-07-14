import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import type { Prisma } from '#prisma-models/index.js';
import getService from '#services/projects/members/change-owner.ts';

//PATCH api/projects/{id}/change-owner/{userId}
//change owner to userId
const changeOwnerController = async (req: Request, res: Response) => {
  const userIdReal = parseInt(req.params.userId as string);
  const projectIdReal = parseInt(req.params.id as string);

  const memberId: Prisma.MembersProjectIdUserIdCompoundUniqueInput = {
    userId: userIdReal,
    projectId: projectIdReal,
  };

  const result = await getService(memberId);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Member not Found',
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

  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};

export default changeOwnerController;
