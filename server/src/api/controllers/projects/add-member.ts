import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import type { Prisma } from '#prisma-models/index.js';
import getService from '#services/projects/add-member.ts';

const addMemberController = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);

  if (isNaN(projectId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid project ID',
      data: null,
      memetype: 'application/json',
    };
    res.status(400).json(resBody);
    return;
  }

  const { userId, roleId } = req.body as { userId: number; roleId?: number };
  const rolesWhereId: Prisma.RolesWhereUniqueInput = { roleId };
  const rolesWhereLabel: Prisma.RolesWhereUniqueInput = { label: 'Member' };

  const rolesWhere = roleId !== undefined ? rolesWhereId : rolesWhereLabel;

  //currently just creating a new JobTitle record,
  //should be changed to avoid duplicate records
  const data: Prisma.MembersCreateInput = {
    projects: { connect: { projectId } },
    users: { connect: { userId } },
    roles: { connect: rolesWhere },
  };

  const result = await getService(data);

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

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'User or Role not found',
      data: null,
      memetype: 'application/json',
    };
    res.status(404).json(resBody);
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

export default addMemberController;
