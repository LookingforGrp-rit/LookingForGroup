import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import type { Prisma } from '#prisma-models/index.js';
import addMemberService from '#services/projects/members/add-member.ts';

//adds a member to the project
const addMemberController = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);

  if (isNaN(projectId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid project ID',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  const { userId, roleId } = req.body as { userId: number; roleId?: number };
  const rolesWhereId: Prisma.RolesWhereUniqueInput = { roleId };
  const rolesWhereLabel: Prisma.RolesWhereUniqueInput = { label: 'Member' };

  const rolesWhere = roleId !== undefined ? rolesWhereId : rolesWhereLabel;

  const data: Prisma.MembersCreateInput = {
    projects: { connect: { projectId } },
    users: { connect: { userId } },
    roles: { connect: rolesWhere },
  };

  const result = await addMemberService(data);

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
      error: 'User or role not found',
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
