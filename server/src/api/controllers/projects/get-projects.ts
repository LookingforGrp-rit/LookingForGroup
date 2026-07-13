import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { getBlocklistIdsByGidService } from '#services/me/blocklist/get-blocklist-ids-by-gid.ts';
import getService from '#services/projects/get-projects.ts';

//GET api/projects
//gets all projects
const getProjectsController = async (req: Request, res: Response): Promise<void> => {
  let result = await getService();

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  // filtering out blocked users
  const userGid = req.session.gid;
  if (userGid) {
    const ids = await getBlocklistIdsByGidService(userGid);
    if (ids !== 'INTERNAL_ERROR') {
      result = result.filter((project) => {
        return !ids.includes(project.owner.userId);
      });
    }
  }

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};

export default getProjectsController;
