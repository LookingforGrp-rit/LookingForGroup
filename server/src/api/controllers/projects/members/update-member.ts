import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import type { Prisma } from '#prisma-models/index.js';
import getService from '#services/projects/members/update-member.ts';

const updateMemberController = async (req: Request, res: Response) => {
  const { userId, id } = req.params;
  const userIdReal = parseInt(userId);
  const projectIdReal = parseInt(id);

  if (isNaN(userIdReal) || isNaN(projectIdReal)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Bad Request (invalid params)',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  const memberId: Prisma.MembersProjectIdUserIdCompoundUniqueInput = {
    userId: userIdReal,
    projectId: projectIdReal,
  };

  const data: Prisma.MembersUpdateInput = req.body as Prisma.MembersUpdateInput;

  const result = await getService(memberId, data);

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

export default updateMemberController;
