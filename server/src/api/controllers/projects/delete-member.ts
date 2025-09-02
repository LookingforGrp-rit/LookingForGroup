import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { deleteMemberService } from '#services/projects/delete-member.ts';

const deleteMemberController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId } = req.params;
  const projectId = parseInt(id);
  const memberId = parseInt(userId);

  if (isNaN(projectId) || isNaN(memberId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid project or member id',
      data: null,
      memetype: 'application/json',
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await deleteMemberService(projectId, memberId);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Member not found',
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
  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: result,
    memetype: 'application/json',
  };
  res.status(200).json(resBody);
};

export default deleteMemberController;
