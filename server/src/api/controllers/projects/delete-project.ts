import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { deleteProjectService } from '#services/projects/delete-project.ts';

//deletes a project
const deleteProjectController = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId);
  const result = await deleteProjectService(projectId);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Project not found',
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
    data: null,
    memetype: 'application/json',
  };
  res.status(200).json(resBody);
};

export default deleteProjectController;
