import type { ApiResponse, CreateProjectMemberInput } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import getService from '#services/projects/members/add-member.ts';

//adds a member to the project
const addMemberController = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
  const memberData: CreateProjectMemberInput = req.body as CreateProjectMemberInput;

  const result = await getService(projectId, memberData);

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
      error: 'User or Role not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

  if (result === 'CONFLICT') {
    const resBody: ApiResponse = {
      status: 409,
      error: 'User already a member of project',
      data: null,
    };
    res.status(409).json(resBody);
    return;
  }

  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};

export default addMemberController;
