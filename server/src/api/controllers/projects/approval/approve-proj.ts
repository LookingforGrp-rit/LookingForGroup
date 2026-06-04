import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { changeProjectApprovalService } from '#services/projects/approval/change-proj-approval.ts';

const approveProjectController = async (request: AuthenticatedRequest, response: Response) => {
  const projectId = parseInt(request.params.id as string);
  const result = await changeProjectApprovalService(projectId, true);

  if (result === 'INTERNAL_ERROR') {
    const res: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    response.status(500).json(res);
    return;
  }

  if (result === 'NOT_FOUND') {
    const res: ApiResponse = {
      status: 404,
      error: 'Project Not Found',
      data: null,
    };
    response.status(404).json(res);
    return;
  }

  const res: ApiResponse = {
    status: 200,
    error: null,
    data: 'Project approved',
  };
  response.status(200).json(res);
};

export default approveProjectController;
