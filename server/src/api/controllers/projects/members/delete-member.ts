import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { deleteMemberService } from '#services/projects/members/delete-member.ts';

//deletes a member from a project
const deleteMemberController = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { userId } = req.params;
  const projectId = parseInt(id);
  const memberId = parseInt(userId);

  const curUser = parseInt(req.currentUser);

  if (isNaN(projectId) || isNaN(memberId) || isNaN(curUser)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid project or member id',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await deleteMemberService(projectId, memberId, curUser);

  if (result === 'FORBIDDEN') {
    const resBody: ApiResponse = {
      status: 403,
      error: 'Insufficient permissions',
      data: null,
    };
    res.status(403).json(resBody);
    return;
  }

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Member not found',
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
    data: null,
  };
  res.status(200).json(resBody);
};

export default deleteMemberController;
