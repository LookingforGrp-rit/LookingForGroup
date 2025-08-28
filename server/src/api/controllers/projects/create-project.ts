/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import type { Prisma } from '#prisma-models/index.js';
import createProjectService from '#services/projects/create-proj.ts';

const createProjectController = async (_req: Request, res: Response) => {
  const curUserId = _req.currentUser;
  _req.body['userId'] = parseInt(curUserId as string);
  const data: Prisma.ProjectsCreateInput = _req.body as Prisma.ProjectsCreateInput;

  const result = await createProjectService(data);

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

export default createProjectController;
