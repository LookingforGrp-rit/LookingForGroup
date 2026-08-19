import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { rejectProjectService } from '#services/projects/approval/reject-project.ts';

//deletes a project from the list of projects awaiting approval
const rejectProjectController = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id as string);
  const result = await rejectProjectService(projectId);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Project not found in list of projects awaiting request.',
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
    status: 204,
    error: null,
    data: null,
  };
  res.status(204).json(resBody);
};

export default rejectProjectController;
