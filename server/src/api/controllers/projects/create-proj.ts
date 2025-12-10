import type {
  ApiResponse,
  AuthenticatedRequest,
  CreateProjectInput,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import createProjectService from '#services/projects/create-proj.ts';

//POST api/projects
//creates a project
const createProjectController = async (req: AuthenticatedRequest, res: Response) => {
  const inputData: Omit<CreateProjectInput, 'thumbnail'> = req.body as Omit<
    CreateProjectInput,
    'thumbnail'
  >;

  const result = await createProjectService(inputData, req.currentUser);

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
    status: 201,
    error: null,
    data: result,
  };
  res.status(201).json(resBody);
};

export default createProjectController;
