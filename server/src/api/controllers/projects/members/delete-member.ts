import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { deleteMemberService } from '#services/projects/members/delete-member.ts';

//DELETE api/projects/{id}/members/{userId}
//deletes a member from a project
const deleteMemberController = async (req: AuthenticatedRequest, res: Response) => {
  const projectId = parseInt(req.params.id);
  const memberId = parseInt(req.params.userId);

  const result = await deleteMemberService(projectId, memberId);

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
